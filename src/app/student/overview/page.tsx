import React from "react";
import OverviewClient from "./OverviewClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Overview | Student Dashboard | Education Malaysia",
  description: "View your application statistics, recent activity, and quick actions in the student dashboard.",
};

export default function OverviewPage() {
  return <OverviewClient />;
}
