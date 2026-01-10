"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Phone,
  Mail,
  Users,
  BarChart3,
  Zap,
  Globe,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Building2,
  GraduationCap,
  Sun,
  Shield,
  Home,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Layers,
  Settings,
  Award,
  Heart,
  Headphones,
} from "lucide-react";

export default function SetShapePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const industries = [
    { name: "Mortgage", icon: Home, color: "text-blue-600" },
    { name: "Insurance", icon: Shield, color: "text-green-600" },
    { name: "Solar", icon: Sun, color: "text-yellow-600" },
    { name: "Education", icon: GraduationCap, color: "text-purple-600" },
    { name: "Small Business", icon: Briefcase, color: "text-orange-600" },
    { name: "Real Estate", icon: Building2, color: "text-cyan-600" },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Tools",
      description: "Smart automation that learns your workflow and helps you close more deals faster.",
    },
    {
      icon: Phone,
      title: "Built-in Calling",
      description: "Click-to-call, power dialer, call recording, and voicemail drops all in one place.",
    },
    {
      icon: Mail,
      title: "Email & SMS",
      description: "Send personalized campaigns at scale with intelligent drip sequences.",
    },
    {
      icon: Users,
      title: "Lead Management",
      description: "Capture, distribute, and nurture leads automatically with smart routing.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Real-time dashboards and custom reports to track performance metrics.",
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Trigger-based workflows that handle repetitive tasks while you focus on selling.",
    },
  ];

  const testimonials = [
    {
      quote: "Our sales have increased over 26% since implementing Shape. The automation alone has saved us countless hours.",
      author: "Michael Rodriguez",
      role: "VP of Sales, Premier Mortgage",
      avatar: "MR",
    },
    {
      quote: "Shape transformed how we manage leads. We went from chaos to a streamlined process that actually works.",
      author: "Sarah Chen",
      role: "Operations Director, SunBright Solar",
      avatar: "SC",
    },
    {
      quote: "The best CRM investment we've made. Support is incredible and the features keep getting better.",
      author: "David Thompson",
      role: "CEO, Thompson Insurance Group",
      avatar: "DT",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/setshape" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Shape</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("features")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Features <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === "features" && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 mt-1">
                    <div className="space-y-1">
                      {[
                        { icon: Sparkles, name: "AI Tools", desc: "Smart automation" },
                        { icon: Phone, name: "Communication", desc: "Calls, SMS, Email" },
                        { icon: Users, name: "Lead Management", desc: "Capture & nurture" },
                        { icon: BarChart3, name: "Reporting", desc: "Analytics & insights" },
                        { icon: Globe, name: "Integrations", desc: "5,000+ apps" },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href="#"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("industries")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Industries <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === "industries" && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 mt-1">
                    <div className="space-y-1">
                      {industries.map((industry) => (
                        <Link
                          key={industry.name}
                          href="#"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <industry.icon className={`w-5 h-5 ${industry.color}`} />
                          <span className="text-sm font-medium text-gray-700">{industry.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="#" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("support")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  Support <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === "support" && (
                  <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-4 mt-1">
                    <div className="space-y-1">
                      {[
                        { name: "Help Center", desc: "Browse documentation" },
                        { name: "Training", desc: "Video tutorials" },
                        { name: "Contact Us", desc: "Get in touch" },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href="#"
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="text-sm font-medium">
                Login
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
            <div className="space-y-3">
              <Link href="#" className="block py-2 text-gray-700 font-medium">Features</Link>
              <Link href="#" className="block py-2 text-gray-700 font-medium">Industries</Link>
              <Link href="#" className="block py-2 text-gray-700 font-medium">Pricing</Link>
              <Link href="#" className="block py-2 text-gray-700 font-medium">Support</Link>
              <hr className="my-4" />
              <Button variant="outline" className="w-full">Login</Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-16 pb-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered CRM Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              More than an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                AI-powered
              </span>{" "}
              CRM
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Shape is the all-in-one sales platform that helps you capture leads, close deals,
              and grow your business with intelligent automation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-blue-600/25">
                Get a Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
                <Play className="mr-2 w-5 h-5" />
                Watch Video
              </Button>
            </div>

            {/* Industry Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((industry) => (
                <button
                  key={industry.name}
                  className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <industry.icon className={`w-5 h-5 ${industry.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-gray-700">{industry.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-t from-white via-transparent to-transparent absolute inset-x-0 bottom-0 h-32 z-10" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mx-auto max-w-5xl">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Leads", value: "2,847", change: "+12.5%", color: "text-green-600" },
                    { label: "Conversions", value: "423", change: "+8.2%", color: "text-green-600" },
                    { label: "Revenue", value: "$847K", change: "+23.1%", color: "text-green-600" },
                    { label: "Avg Response", value: "4.2min", change: "-15%", color: "text-green-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs ${stat.color} font-medium`}>{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 h-48">
                    <p className="text-sm font-medium text-gray-700 mb-4">Lead Activity</p>
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-4">Pipeline</p>
                    <div className="space-y-3">
                      {[
                        { stage: "New", count: 156, color: "bg-blue-500" },
                        { stage: "Contacted", count: 89, color: "bg-cyan-500" },
                        { stage: "Qualified", count: 42, color: "bg-green-500" },
                        { stage: "Proposal", count: 28, color: "bg-orange-500" },
                      ].map((item) => (
                        <div key={item.stage} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-xs text-gray-600 flex-1">{item.stage}</span>
                          <span className="text-xs font-medium text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">from 2,000+ reviews</span>
            </div>
            <div className="flex items-center gap-6">
              {[
                { icon: Award, label: "High Performer" },
                { icon: Headphones, label: "Best Support" },
                { icon: Heart, label: "Users Love Us" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-gray-600">
                  <badge.icon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to{" "}
              <span className="text-blue-600">close more deals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete sales platform with all the tools your team needs to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-blue-600 font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Suite Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                Marketing Suite
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Professionally designed templates for every channel
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access hundreds of professionally designed print, digital, and social templates.
                Customize them with your brand and send across multiple channels.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Email templates with drag-and-drop editor",
                  "Social media post templates",
                  "Print-ready flyers and brochures",
                  "Landing page builder included",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Explore Marketing Tools
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Email Templates", count: "200+" },
                  { label: "Social Posts", count: "150+" },
                  { label: "Landing Pages", count: "50+" },
                  { label: "Print Designs", count: "100+" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-1">{item.count}</p>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Hub Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Incoming Call</p>
                    <p className="text-sm text-gray-300">John Smith - Lead #4829</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Phone, label: "Calls Today", value: "47" },
                    { icon: MessageSquare, label: "SMS Sent", value: "156" },
                    { icon: Mail, label: "Emails", value: "89" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
                      <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
                <Phone className="w-4 h-4" />
                Communication Hub
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Every conversation in one place
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built-in VoIP calling, SMS messaging, and email integration.
                No need for separate tools or complex integrations.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Click-to-call with power dialer",
                  "Two-way SMS messaging",
                  "Email sequences and templates",
                  "Call recording and voicemail drops",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                See Communication Features
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Automation Engine
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Work smarter, not harder
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Set up powerful automations that handle repetitive tasks, nurture leads,
                and keep your pipeline moving while you focus on closing.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Target, label: "Smart Lead Routing" },
                  { icon: Clock, label: "Scheduled Follow-ups" },
                  { icon: TrendingUp, label: "Drip Campaigns" },
                  { icon: Settings, label: "Custom Triggers" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <item.icon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Discover Automation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Automation Workflow
                </div>
                {[
                  { step: "Trigger", desc: "New lead submitted", color: "bg-blue-500" },
                  { step: "Action", desc: "Send welcome email", color: "bg-green-500" },
                  { step: "Wait", desc: "2 hours", color: "bg-gray-400" },
                  { step: "Action", desc: "Send SMS follow-up", color: "bg-green-500" },
                  { step: "Condition", desc: "If no response in 24h", color: "bg-orange-500" },
                  { step: "Action", desc: "Assign to sales rep", color: "bg-green-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{item.step}</p>
                      <p className="font-medium text-gray-900">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full text-cyan-700 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Integrations
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Connects with your favorite tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            5,000+ integrations through Zapier and native connections with the tools you already use.
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              "Google", "Salesforce", "Zapier", "Slack", "Mailchimp",
              "QuickBooks", "Calendly", "Zoom", "HubSpot", "Stripe",
              "Facebook", "DocuSign",
            ].map((app) => (
              <div
                key={app}
                className="px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-medium hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {app}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by sales teams everywhere
            </h2>
            <p className="text-xl text-gray-400">
              See why thousands of businesses trust Shape
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of sales teams using Shape to close more deals and grow revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl">
              Get a Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/setshape" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Shape</span>
              </Link>
              <p className="text-sm mb-4 max-w-xs">
                The all-in-one sales platform that helps you capture leads, close deals,
                and grow your business.
              </p>
              <div className="flex gap-4">
                {["LinkedIn", "Twitter", "Facebook", "YouTube"].map((social) => (
                  <Link key={social} href="#" className="hover:text-white transition-colors text-sm">
                    {social}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                {["Features", "Pricing", "Integrations", "API"].map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Industries</h4>
              <ul className="space-y-2 text-sm">
                {industries.map((industry) => (
                  <li key={industry.name}>
                    <Link href="#" className="hover:text-white transition-colors">{industry.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                {["Help Center", "Blog", "Training", "Contact"].map((link) => (
                  <li key={link}>
                    <Link href="#" className="hover:text-white transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-gray-800">
            {["SOC 2", "HIPAA", "PCI DSS", "GDPR"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{badge} Compliant</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Shape Software, Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <Link key={link} href="#" className="hover:text-white transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
