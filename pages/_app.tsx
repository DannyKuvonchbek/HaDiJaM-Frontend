import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useApollo } from "@/libs/apollo/client";
import { theme } from "@/libs/theme";
import { CurrencyProvider } from "@/libs/utils/CurrencyProvider";
import "../styles/fonts.css";
import "../scss/app.scss";
import "../scss/pc/main.scss";
import "../scss/mobile/main.scss";
import "../scss/pc/screen.scss";
import "../scss/pc/typography.scss";

export default function App({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={client}>
      <CurrencyProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </CurrencyProvider>
    </ApolloProvider>
  );
}
