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
    "The Abu Sufyan Al-Alma'iyy Foundation is a non-profit foundation dedicated to the donation of the noble Qur'an and beneficial Islamic books to students of knowledge, Islamic schools, and to mosques to promote the understanding of Islam amongst all.",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Our Work", href: "/#our-work" },
    { label: "Sponsor a Book", href: "/books" },
    { label: "Apply for Books", href: "/apply" },
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

  contact: {
    email: "abusufyanfoundation@gmail.com",
    phone: "08164758649",
    address: "Lagos, Nigeria",
  },
};

// Public address of the website, without a trailing slash
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
