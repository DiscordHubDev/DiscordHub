import { useSession, signIn } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";
import { Button } from "../button";

function DiscordLoginButton() {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <Button
      onClick={() => signIn("discord")}
      className="font-sans discord hover:bg-discord/70 focus:ring-4 font-medium rounded-lg text-sm my-1.5"
    >
      <FaDiscord /> Discord 登入
    </Button>
  );
}

export default DiscordLoginButton;
