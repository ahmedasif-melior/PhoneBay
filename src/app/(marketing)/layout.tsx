import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { getCurrentUser } from "@/server/http";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
