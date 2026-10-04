type NavItem = { label: string; href: string };

type ContactInfo = {
  email: string | null;
  phone: string | null;
  address: string | null;
};

export const siteConfig: {
  name: string;
  description: string;
  nav: readonly NavItem[];
  cta: NavItem;
  social: readonly NavItem[];
  contact: ContactInfo;
} = {
  name: "Abu Sufyan Al-Alma'iyy Foundation",
  description:
    "A charitable Islamic foundation providing beneficial books and study materials to students of knowledge.",

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Our Work", href: "/#our-work" },
    { label: "Books", href: "/#books" },
    { label: "Campaigns", href: "/#campaign" },
    { label: "Impact", href: "/#impact" },
  ],

  cta: { label: "Support Us", href: "/support" },

  social: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61583261276625",
    },
    {
      label: "WhatsApp group",
      href: "https://chat.whatsapp.com/LiN6qKSC51jExhIxV4YPPW",
    },
  ],

  // Fill these in when you have them. Empty ones are hidden in the footer.
  contact: {
    email: null,
    phone: null,
    address: null,
  },
};
