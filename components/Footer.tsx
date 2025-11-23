"use client";

import Link from "next/link";
import { useTranslation } from "../lib/hooks/useTranslation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale, isRTL, t } = useTranslation();

  const translations = {
    en: {
      developmentTeam: "Development Team",
      allRightsReserved: "© All Rights Reserved",
      softwareRights: "Software Rights",
      designedWith: "Designed with",
      by: "by",
    },
    ar: {
      developmentTeam: "فريق التطوير",
      allRightsReserved: "© جميع الحقوق محفوظة",
      softwareRights: "حقوق البرمجيات",
      designedWith: "صُمم بـ",
      by: "بواسطة",
    },
  };

  const t_local = translations[locale === "ar" ? "ar" : "en"];

  return (
    <footer className="mt-auto py-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>

      <div className="px-4 relative z-10" dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div
            className={`flex flex-col ${
              isRTL
                ? "md:items-end items-center"
                : "md:items-start items-center"
            }`}
          >
            <h3 className="text-primary font-display text-lg mb-4 cyberpunk-border">
              Codixverse
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {t_local.developmentTeam}
            </p>
            <div
              className={`flex ${
                isRTL ? "space-x-reverse" : ""
              } space-x-4 mt-2`}
            >
              <a
                href="https://github.com/orgs/Codixverse"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://github.com/orgs/Codixverse"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Link href="/" className="mb-4">
              <div className="flex items-center">
                <span className="text-primary font-display text-xl font-bold">
                  {t("common.site_name_first", "WEXON")}
                </span>
                <span className="text-white font-display text-xl font-bold">
                  &nbsp;{t("common.site_name_second", "TOWN")}
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400">
              {t_local.allRightsReserved} {currentYear}
            </p>
          </div>

          <div
            className={`flex flex-col ${
              isRTL
                ? "md:items-start items-center"
                : "md:items-end items-center"
            }`}
          >
            <h3 className="text-primary font-display text-lg mb-4 cyberpunk-border">
              Codixverse
            </h3>
            <p className="text-sm text-gray-400">{t_local.softwareRights}</p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            {t_local.designedWith} <span className="text-primary">♥</span>{" "}
            {t_local.by} Codixverse
          </p>
        </div>
      </div>
    </footer>
  );
}
