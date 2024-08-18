export const setSubtitle = (type: "create" | "take" | "close"): string => {
  switch (type) {
    case "create":
      return `Your escrow has been created! You can now view your escrow on the dashboard. 
        The escrow can be closed or redeemed through the dashboard.
                        You can also choose to share a blink for easier trade`;

    case "take":
      return `Your withdrawl is complete and the escrow account has
                        been closed. Please check the details below.`;

    case "close":
      return `Your escrow has been closed and the funds have been
                        transferred back to the maker account.`;

    default:
      return "";
  }
};
