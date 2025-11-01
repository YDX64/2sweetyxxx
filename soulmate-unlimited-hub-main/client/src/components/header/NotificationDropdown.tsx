import {
  Bell,
  Heart,
  MessageCircle,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/types/common";

interface Notification {
  id: string;
  type:
    | "match"
    | "message"
    | "like"
    | "super_like"
    | "profile_view"
    | "photo_approved"
    | "photo_rejected"
    | "subscription_expiring"
    | "subscription_renewed";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    name: string;
    photos: string[];
  };
  data?: string;
}

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch notifications from database
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      return response.json();
    },
    select: (data) => data.notifications as Notification[],
    enabled: !!user, // Only fetch when user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch notification count
  const { data: countData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch notification count: ${response.status}`,
        );
      }
      return response.json();
    },
    select: (data) => data.count as number,
    enabled: !!user, // Only fetch when user is authenticated
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread-count"],
      });
    },
  });

  const notifications = notificationsData || [];
  const notificationCount = countData || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "like":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "super_like":
        return <Star className="w-4 h-4 text-purple-500" />;
      case "profile_view":
        return <Eye className="w-4 h-4 text-green-500" />;
      case "photo_approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "photo_rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "subscription_expiring":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "subscription_renewed":
        return <Crown className="w-4 h-4 text-gold-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "match":
        return "bg-pink-500";
      case "message":
        return "bg-blue-500";
      case "like":
        return "bg-yellow-500";
      case "super_like":
        return "bg-purple-500";
      case "profile_view":
        return "bg-green-500";
      case "photo_approved":
        return "bg-green-500";
      case "photo_rejected":
        return "bg-red-500";
      case "subscription_expiring":
        return "bg-orange-500";
      case "subscription_renewed":
        return "bg-gold-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "match":
        navigate("/matches");
        break;
      case "message":
        navigate("/messages");
        break;
      case "like":
      case "super_like":
        navigate("/likes");
        break;
      case "profile_view":
        navigate("/profile");
        break;
      case "photo_approved":
      case "photo_rejected":
        navigate("/settings/profile");
        break;
      case "subscription_expiring":
      case "subscription_renewed":
        navigate("/upgrades");
        break;
      default:
        break;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return t("notificationJustNow") || "Just now";
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours === 1 ? t("notificationHourAgo") : t("notificationHoursAgo")}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? t("notificationDayAgo") : t("notificationDaysAgo")}`;
  };

  const getLocalizedNotificationContent = (notification: Notification) => {
    // Try to translate the title, fallback to original if no translation exists
    const title = t(notification.title) || notification.title;

    // Parse notification data to get dynamic content
    let parsedData: Record<string, unknown> = {};
    try {
      parsedData = notification.data ? JSON.parse(notification.data) : {};
    } catch (e) {
      // Handle case where data is not valid JSON
    }

    // Create localized message based on notification type with dynamic data
    let message = t(notification.message) || notification.message;

    // Handle specific notifications that need dynamic content
    switch (notification.type) {
      case "match":
        if (parsedData.matchedUserName) {
          message =
            t("newMatchNotificationMessage") ||
            `You matched with ${parsedData.matchedUserName}!`;
        }
        break;
      case "message":
        if (parsedData.senderName && parsedData.preview) {
          const previewText = String(parsedData.preview);
          message = `${parsedData.senderName}: ${previewText.substring(0, 50)}${previewText.length > 50 ? "..." : ""}`;
        } else {
          message =
            t("newMessageNotificationMessage") || "You have a new message";
        }
        break;
      case "like":
        if (parsedData.likerName) {
          message = `${parsedData.likerName} ${t("likedYourProfile") || "liked your profile"}`;
        } else {
          message =
            t("likeNotificationMessage") || "Someone liked your profile";
        }
        break;
      case "super_like":
        if (parsedData.likerName) {
          message = `${parsedData.likerName} ${t("superLikedYourProfile") || "super liked your profile"}`;
        } else {
          message =
            t("superLikeNotificationMessage") ||
            "Someone super liked your profile";
        }
        break;
      case "profile_view":
        if (parsedData.viewerName) {
          message = `${parsedData.viewerName} ${t("viewedYourProfile") || "viewed your profile"}`;
        } else {
          message =
            t("profileViewNotificationMessage") ||
            "Someone viewed your profile";
        }
        break;
      case "subscription_expiring":
        if (parsedData.daysLeft) {
          const daysText =
            parsedData.daysLeft === 1 ? t("day") || "day" : t("days") || "days";
          message = `${t("subscriptionExpiresIn") || "Your subscription expires in"} ${parsedData.daysLeft} ${daysText}`;
        } else {
          message =
            t("subscriptionExpiringNotificationMessage") ||
            "Your subscription expires soon";
        }
        break;
      case "subscription_renewed":
        if (parsedData.planName) {
          message = `${t("yourSubscriptionRenewed") || "Your"} ${parsedData.planName} ${t("subscriptionHasBeenRenewed") || "subscription has been renewed"}`;
        } else {
          message =
            t("subscriptionRenewedNotificationMessage") ||
            "Your subscription has been renewed";
        }
        break;
      case "photo_rejected":
        if (parsedData.reason) {
          message = `${t("photoRejectedNotificationMessage") || "Your photo was rejected"}: ${parsedData.reason}`;
        } else {
          message =
            t("photoRejectedNotificationMessage") || "Your photo was rejected";
        }
        break;
      default:
        // For other types, just try to translate the message
        message = t(notification.message) || notification.message;
    }

    return { title, message };
  };

  // Don't render dropdown if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-9 w-9 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 rounded-full focus-ring dark:text-gray-300"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="badge-primary absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-white dark:bg-gray-800/95 border dark:border-gray-700/50 shadow-lg z-[60] backdrop-blur-md"
        sideOffset={5}
      >
        <div className="p-3 border-b dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-responsive-base">
            {t("notificationsDropdownTitle")}
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("loadingNotifications") || "Loading notifications..."}
            </p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("errorLoadingNotifications") || "Unable to load notifications"}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("noNotifications") || "No notifications yet"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { title, message } =
              getLocalizedNotificationContent(notification);
            return (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 flex items-start gap-3 interactive-element"
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className={`w-2 h-2 ${getNotificationColor(notification.type)} rounded-full flex-shrink-0 mt-2 ${notification.isRead ? "opacity-50" : ""}`}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getNotificationIcon(notification.type)}
                    <p
                      className={`text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight ${notification.isRead ? "opacity-70" : ""}`}
                    >
                      {title}
                    </p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight ${notification.isRead ? "opacity-70" : ""}`}
                  >
                    {message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
