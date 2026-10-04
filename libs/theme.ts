import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#d4af37", contrastText: "#0b0b0b" },
    background: { default: "#131313", paper: "#1c1b1b" },
    text: { primary: "#f5f1e8", secondary: "#bdb8af" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});
