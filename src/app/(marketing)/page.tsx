import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ImpactSection } from "@/components/marketing/ImpactSection";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingPage() {
  const supabase = await createClient();

  const { data: featuredCharities } = await supabase
    .from("charities")
    .select("id, name, description, images, logo_url")
    .eq("featured", true)
    .limit(3);

  const { count: usersCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  const { count: charitiesCount } = await supabase
    .from("charities")
    .select("id", { count: "exact", head: true });

  const { data: sumData } = await supabase
    .from("donations")
    .select("amount");

  const totalDonations = (sumData || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <ImpactSection
          featuredCharities={featuredCharities || []}
          stats={{
            totalDonated: totalDonations,
            charitiesSupported: charitiesCount || 0,
            playersCount: usersCount || 0,
          }}
        />
        <Testimonials />
        <Faq />
      </main>
    </>
  );
}
