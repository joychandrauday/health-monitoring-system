"use client"
import NavbarDesign from "./NavbarDesign";
type UserProps = {
  user?: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    role: string | null | undefined;
    image?: string | null | undefined;
  }
}
const Navbar = ({ session }: { session: UserProps | null }) => {
  console.log(session);
  return (
    <NavbarDesign session={session} />
  );
};

export default Navbar;
