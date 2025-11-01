import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Send,
  Shield,
  Heart,
  Users,
  Settings,
  BookOpen,
  FileText,
  ExternalLink,
  Crown
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const HelpSettings = () => {
  const { t } = useLanguage();
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    email: ""
  });

  const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.message || !contactForm.email) {
      toast({
        title: t("helpCenter.contactFormMissingInfoToastTitle"),
        description: t("helpCenter.contactFormMissingInfoToastDescription"),
        variant: "destructive"
      });
      return;
    }

    console.log('Sending contact form:', contactForm);
    toast({
      title: t("helpCenter.contactFormSuccessToastTitle"),
      description: t("helpCenter.contactFormSuccessToastDescription"),
    });
    
    setContactForm({ subject: "", message: "", email: "" });
  };

  const faqData = [
    {
      id: 'getting-started',
      title: t("helpCenter.gettingStartedFaq"),
      icon: Users,
      questions: [
        {
          q: t("helpCenter.howToCreateProfileQuestion"),
          a: t("helpCenter.howToCreateProfileAnswer")
        },
        {
          q: t("helpCenter.howToAddPhotosQuestion"),
          a: t("helpCenter.howToAddPhotosAnswer")
        },
        {
          q: t("helpCenter.howToVerifyProfileQuestion"),
          a: t("helpCenter.howToVerifyProfileAnswer")
        },
        {
          q: t("helpCenter.howMatchingWorksQuestion"),
          a: t("helpCenter.howMatchingWorksAnswer")
        }
      ]
    },
    {
      id: 'subscription',
      title: t("helpCenter.subscriptionFaq"),
      icon: Crown,
      questions: [
        {
          q: t("helpCenter.whatIsPremiumQuestion"),
          a: t("helpCenter.whatIsPremiumAnswer")
        },
        {
          q: t("helpCenter.howToCancelSubscriptionQuestion"),
          a: t("helpCenter.howToCancelSubscriptionAnswer")
        },
        {
          q: t("helpCenter.refundPolicyQuestion"),
          a: t("helpCenter.refundPolicyAnswer")
        }
      ]
    },
    {
      id: 'safety',
      title: t("helpCenter.safetyFaq"),
      icon: Shield,
      questions: [
        {
          q: t("helpCenter.howToReportUserQuestion"),
          a: t("helpCenter.howToReportUserAnswer")
        },
        {
          q: t("helpCenter.howToBlockUserQuestion"),
          a: t("helpCenter.howToBlockUserAnswer")
        },
        {
          q: t("helpCenter.safetyTipsQuestion"),
          a: t("helpCenter.safetyTipsAnswer")
        }
      ]
    },
    {
      id: 'technical',
      title: t("helpCenter.technicalFaq"),
      icon: Settings,
      questions: [
        {
          q: t("helpCenter.appNotWorkingQuestion"),
          a: t("helpCenter.appNotWorkingAnswer")
        },
        {
          q: t("helpCenter.notReceivingNotificationsQuestion"),
          a: t("helpCenter.notReceivingNotificationsAnswer")
        },
        {
          q: t("helpCenter.accountDeleteQuestion"),
          a: t("helpCenter.accountDeleteAnswer")
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: t("quickAccessEmailTitle"),
      description: t("helpCenter.quickAccessEmailDescription"),
      action: t("helpCenter.quickAccessEmailAction"),
      color: "text-blue-500"
    },
    {
      icon: MessageCircle,
      title: t("quickAccessChatTitle"),
      description: t("helpCenter.quickAccessChatDescription"),
      action: t("helpCenter.quickAccessChatAction"),
      color: "text-green-500"
    },
    {
      icon: Phone,
      title: t("helpCenter.quickAccessPhoneTitle"),
      description: t("helpCenter.quickAccessPhoneDescription"),
      action: t("helpCenter.quickAccessPhoneAction"),
      color: "text-purple-500"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("helpCenterTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("helpCenter.helpCenterDescription")}</p>
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm hover:bg-gray-50/70 dark:hover:bg-gray-700/50">
            <CardContent className="p-4 text-center">
              <option.icon className={`w-8 h-8 mx-auto mb-2 ${option.color}`} />
              <h3 className="font-semibold mb-1 dark:text-gray-100">{option.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">{option.description}</p>
              <Button variant="outline" size="sm" className="w-full dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-600/50">
                {option.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SSS */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <HelpCircle className="w-5 h-5 text-pink-500" />
            {t("faqTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqData.map((category) => (
              <div key={category.id}>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  <category.icon className="w-5 h-5 text-pink-500" />
                  {category.title}
                </h3>
                
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((item, index) => (
                    <AccordionItem key={index} value={`${category.id}-${index}`} className="border dark:border-gray-600/50 border-gray-200/70 rounded-lg px-4 dark:bg-gray-700/30">
                      <AccordionTrigger className="text-left hover:no-underline dark:text-gray-100">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300 pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* İletişim Formu */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Mail className="w-5 h-5 text-pink-500" />
            {t("helpCenter.contactFormTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("nameLabel")}
              </label>
              <input
                type="text"
                className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder={t("helpCenter.namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder={t("helpCenter.emailPlaceholder")}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("helpCenter.subjectLabel")}
            </label>
            <input
              type="text"
              className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder-gray-400"
              placeholder={t("helpCenter.subjectPlaceholder")}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("helpCenter.messageLabel")}
            </label>
            <textarea
              rows={4}
              className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder-gray-400"
              placeholder={t("helpCenter.messagePlaceholder")}
            />
          </div>
          
          <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white">
            <Send className="w-4 h-4 mr-2 text-white" />
            {t("helpCenter.sendMessageButton")}
          </Button>
        </CardContent>
      </Card>

      {/* Ek Kaynaklar */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t("helpCenter.additionalResourcesTitle")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start dark:bg-green-900/20 dark:border-green-600/30 dark:text-green-300 border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-800/30">
                <FileText className="w-4 h-4 mr-2" />
                {t("helpCenter.userGuideButton")}
              </Button>
              <Button variant="outline" className="w-full justify-start dark:bg-green-900/20 dark:border-green-600/30 dark:text-green-300 border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-800/30">
                <Shield className="w-4 h-4 mr-2" />
                {t("helpCenter.safetyGuideButton")}
              </Button>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start dark:bg-green-900/20 dark:border-green-600/30 dark:text-green-300 border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-800/30">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("helpCenter.communityForumButton")}
              </Button>
              <Button variant="outline" className="w-full justify-start dark:bg-green-900/20 dark:border-green-600/30 dark:text-green-300 border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-800/30">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("helpCenter.liveChatButton")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
