import { Avatar, Badge } from "@mui/joy";

export const AvatarWithStatus = (props) => {
  const { online = false, ...other } = props;
  return (
    <div>
      <Badge
        color={online ? "success" : "neutral"}
        variant={online ? "solid" : "soft"}
        size="sm"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeInset="4px 4px"
      >
        <Avatar size="sm" {...other} />
      </Badge>
    </div>
  );
};
