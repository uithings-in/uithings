import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us - ui things",
  description: "Get in touch with the ui things team for support, custom requests, or general inquiries.",
};

export default function ContactPage() {
  return <ContactClient />;
}
