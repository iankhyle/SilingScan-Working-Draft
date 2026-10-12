import {
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardList,
  House,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import type { UserRole } from "../lib/auth";

export const getResources = (role: UserRole | undefined) =>
  role === "farmer"
    ? [
        {
          name: "home",
          list: "/",
          meta: { label: "Plant scanner", icon: <House /> },
        },
        {
          name: "crops",
          list: "/crops",
          meta: { label: "My crops", icon: <Sprout /> },
        },
        {
          name: "history",
          list: "/history",
          meta: { label: "My scans", icon: <ClipboardList /> },
        },
        {
          name: "advisories",
          list: "/advisories",
          meta: { label: "Field guidance", icon: <BookOpenCheck /> },
        },
        {
          name: "guidance",
          list: "/guidance",
          meta: { label: "Care plan", icon: <Leaf /> },
        },
      ]
    : role === "researcher"
      ? [
          {
            name: "research",
            list: "/research",
            meta: { label: "Research overview", icon: <ChartNoAxesCombined /> },
          },
          {
            name: "scan",
            list: "/",
            meta: { label: "Scan a plant", icon: <House /> },
          },
          {
            name: "history",
            list: "/history",
            meta: { label: "Scan archive", icon: <ClipboardList /> },
          },
          {
            name: "advisories",
            list: "/advisories",
            meta: { label: "Field guidance", icon: <BookOpenCheck /> },
          },
          {
            name: "guidance",
            list: "/guidance",
            meta: { label: "Care plan", icon: <Leaf /> },
          },
        ]
      : role === "agriculturist"
        ? [
            {
              name: "advisories",
              list: "/advisories",
              meta: { label: "Advisory library", icon: <BookOpenCheck /> },
            },
            {
              name: "history",
              list: "/history",
              meta: { label: "Crop health records", icon: <Leaf /> },
            },
          ]
        : role === "admin"
          ? [
              {
                name: "admin",
                list: "/admin",
                meta: { label: "People & access", icon: <ShieldCheck /> },
              },
              {
                name: "history",
                list: "/history",
                meta: { label: "Scan archive", icon: <ClipboardList /> },
              },
              {
                name: "advisories",
                list: "/advisories",
                meta: { label: "Field guidance", icon: <BookOpenCheck /> },
              },
            ]
          : [
              {
                name: "dashboard",
                list: "/",
                meta: { label: "Home", icon: <House /> },
              },
            ];
