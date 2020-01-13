import accountInfo from "@/js/account";

accountInfo.isAdmin().then(isAdmin => {
  console.log("is admin: ", isAdmin);
});
