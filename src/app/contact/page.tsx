'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';

const OFFICES = [
  {
    city: 'London HQ',
    address: '100 Bishopsgate, Level 24, London EC2N 4AG, United Kingdom',
    phone: '+44 20 7946 0912',
    hours: '08:00 – 18:00 GMT',
  },
  {
    city: 'San Francisco Tech Hub',
    address: '500 Howard Street, Suite 400, San Francisco, CA 94105, USA',
    phone: '+1 (800) 458-7391',
    hours: '09:00 – 19:00 PST',
  },
  {
    city: 'Singapore APAC Center',
    address: 'Marina Bay Financial Centre Tower 1, Singapore 018981',
    phone: '+65 6712 3840',
    hours: '09:00 – 18:00 SGT',
  },
];

export default function ContactUsPage(): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'orders',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
    }
  };

  return (
    <AppShell>
      <div className="bg-[#070708] text-white min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span>24/7 Global Communications Desk</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Get in Touch with Aureon
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              Have questions regarding an order, seller onboarding, enterprise partnerships, or press inquiries?
              Our global team is available 24/7 to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Send Us a Direct Message</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">Average response time: under 15 minutes</p>
              </div>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                  <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Message Dispatched Successfully</h3>
                  <p className="text-xs text-[#D4D4D8] max-w-md mx-auto leading-relaxed">
                    Thank you, {formData.name}. We have received your inquiry and our support team will reply to{' '}
                    <strong className="text-amber-400">{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', topic: 'orders', subject: '', message: '' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 pt-2"
                  >
                    Send another message &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Sarah Johnson"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-topic" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                        Topic of Inquiry
                      </label>
                      <select
                        id="contact-topic"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="orders">Customer Order & Delivery Support</option>
                        <option value="returns">Return & Refund Escrow</option>
                        <option value="seller">Merchant & Vendor Solutions</option>
                        <option value="enterprise">B2B Wholesale & Enterprise</option>
                        <option value="partnership">Affiliate & Press Inquiries</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        placeholder="Inquiry regarding order #..."
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-msg" className="block text-xs font-bold text-[#D4D4D8] mb-1.5 uppercase tracking-wider">
                      Message Details *
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={5}
                      required
                      placeholder="Please describe how we can assist you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl bg-[#141417] border border-[#27272A] px-4 py-3 text-xs text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 flex items-center justify-center gap-2"
                  >
                    <span>Transmit Message to Support Desk</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact & Office Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Channels */}
              <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-amber-400" />
                  Instant Direct Channels
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141417] border border-[#27272A]">
                    <div>
                      <p className="font-bold text-white">General Customer Care</p>
                      <p className="text-[#9CA3AF]">support@aureon.market</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      24/7 Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141417] border border-[#27272A]">
                    <div>
                      <p className="font-bold text-white">Merchant Seller Desk</p>
                      <p className="text-[#9CA3AF]">sellers@aureon.market</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Mon–Fri
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141417] border border-[#27272A]">
                    <div>
                      <p className="font-bold text-white">Press & Institutional</p>
                      <p className="text-[#9CA3AF]">press@aureon.market</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      Media
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Global Hubs */}
              <div className="rounded-2xl bg-[#0F0F12] border border-[#27272A] p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-400" />
                  Global Operating Headquarters
                </h3>

                <div className="space-y-3.5 text-xs">
                  {OFFICES.map((off) => (
                    <div key={off.city} className="space-y-1 pb-3 border-b border-[#1F1F24] last:border-none last:pb-0">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{off.city}</span>
                        <span className="text-[11px] text-[#A1A1AA] font-normal">{off.phone}</span>
                      </div>
                      <p className="text-[#9CA3AF] text-[11px]">{off.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
