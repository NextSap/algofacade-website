import type {AppProps} from 'next/app';
import "./base.css";
import localFont from 'next/font/local'
import Head from "next/head";

// Font files can be colocated inside of `pages`
const myFont = localFont({src: "../../public/Montserrat-Regular.ttf"})
export default function App({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>Algo Façade</title>
                <link rel="shortcut icon" href="/images/ShortLogo.ico" />
            </Head>
            <main className={myFont.className}>
                <Component {...pageProps} />
            </main>

        </>
    );
}
