
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import { MatchesPage } from "@/pages/MatchesPage";
import { LikesPage } from "@/pages/LikesPage";
import { ILikedPage } from "@/pages/ILikedPage";
import { GuestsPage } from "@/pages/GuestsPage";
import { UpgradesPage } from "@/pages/UpgradesPage";
import { MessagesPage } from "@/pages/MessagesPage";

interface ViewManagerProps {
  currentView: string;
}

export const ViewManager = ({ currentView }: ViewManagerProps) => {
  switch (currentView) {
    case "discover":
      return <DiscoveryView />;
    case "matches":
      return <MatchesPage />;
    case "likes":
      return <LikesPage />;
    case "i-liked":
      return <ILikedPage />;
    case "messages":
      return <MessagesPage />;
    case "guests":
      return <GuestsPage />;
    case "upgrades":
      return <UpgradesPage />;
    case "profile":
      return <Profile />;
    case "settings":
      return <Settings />;
    default:
      return <DiscoveryView />;
  }
};
