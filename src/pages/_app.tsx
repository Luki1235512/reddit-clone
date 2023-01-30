import type { AppProps } from 'next/app'
import {ChakraProvider} from "@chakra-ui/provider";
import {theme} from "../chakra/theme";
import Layout from "@/src/components/layout/Layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider theme={theme}>
          <Layout>
              <Component {...pageProps} />
          </Layout>
      </ChakraProvider>
  );
}

export default MyApp;
