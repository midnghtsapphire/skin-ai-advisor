import { Sparkles, Camera, TrendingUp, Search, Users, Shield } from "lucide-react";

export const features = [
  {
    icon: Camera,
    title: "AI Skin Analysis",
    description: "Our advanced AI analyzes your skin using just your phone's camera, identifying your unique skin type, concerns, and needs.",
  },
  {
    icon: Sparkles,
    title: "Personalized Routines",
    description: "Get a customized skincare routine tailored to your skin, with product recommendations from hundreds of trusted brands.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Track your skin's transformation over time with photos, journals, and detailed analytics to see real results.",
  },
  {
    icon: Search,
    title: "Ingredient Checker",
    description: "Scan any product to check if its ingredients are right for your skin type and concerns. No more guesswork.",
  },
];

export const howItWorks = [
  {
    step: 1,
    title: "Take a Selfie",
    description: "Snap a quick photo of your face using our guided camera feature for accurate analysis.",
  },
  {
    step: 2,
    title: "Get Your Analysis",
    description: "Our AI examines your skin and identifies your unique skin type, concerns, and goals.",
  },
  {
    step: 3,
    title: "Receive Your Routine",
    description: "Get a personalized skincare routine with product recommendations tailored just for you.",
  },
  {
    step: 4,
    title: "Track & Improve",
    description: "Log your daily routine and track your progress as your skin transforms over time.",
  },
];

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic skin analysis",
    features: [
      "Basic AI skin analysis",
      "Skin type identification",
      "3 product recommendations",
      "Community access",
    ],
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "/month",
    description: "Full access to your personal skincare advisor",
    features: [
      "Advanced AI skin analysis",
      "Unlimited product recommendations",
      "Personalized routines",
      "Progress tracking & photos",
      "Ingredient checker",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start 7-Day Free Trial",
  },
  {
    name: "Annual",
    price: "$119",
    period: "/year",
    description: "Best value — save 33%",
    features: [
      "Everything in Pro",
      "Exclusive brand discounts",
      "Early access to features",
      "1-on-1 skin consultation",
    ],
    highlighted: false,
    cta: "Get Annual Plan",
  },
];

export const faqs = [
  {
    question: "How accurate is the AI skin analysis?",
    answer: "Our AI has been trained on millions of skin images across all skin tones and types, achieving 94% accuracy in identifying skin concerns. We continuously improve our model based on user feedback and dermatologist input.",
  },
  {
    question: "Is my skin data private and secure?",
    answer: "Absolutely. Your photos and data are encrypted and stored securely. We never share your personal information or images with third parties. You can delete your data at any time.",
  },
  {
    question: "Do you only recommend specific brands?",
    answer: "No! Aura is completely brand-agnostic. We recommend products from over 500 brands based solely on what's best for your skin, not on partnerships or sponsorships.",
  },
  {
    question: "Can I use Aura if I have sensitive skin?",
    answer: "Yes! Aura is especially helpful for sensitive skin. Our AI identifies sensitivities and allergens, ensuring all recommendations are safe for your specific skin needs.",
  },
  {
    question: "How soon will I see results?",
    answer: "Most users start seeing improvements within 2-4 weeks of following their personalized routine. Our progress tracking helps you visualize changes over time.",
  },
];

export const testimonials = [
  {
    name: "Sarah M.",
    role: "Skincare Enthusiast",
    content: "Aura finally helped me understand my combination skin. The personalized routine cleared my acne in just 6 weeks!",
    rating: 5,
  },
  {
    name: "Emma L.",
    role: "Busy Professional",
    content: "I love how easy it is to scan products while shopping. No more buying things that break me out!",
    rating: 5,
  },
  {
    name: "Jessica K.",
    role: "Skincare Newbie",
    content: "As a complete beginner, Aura made skincare simple. The step-by-step routine is a game changer.",
    rating: 5,
  },
];

export const stats = [
  { value: "500+", label: "Partner Brands" },
  { value: "94%", label: "Analysis Accuracy" },
  { value: "50K+", label: "Happy Users" },
  { value: "4.8", label: "App Store Rating" },
];
