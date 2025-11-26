export const metadata = {
  title: "Norma–Realidad | Analizador",
  description:
    "App para identificar coherencias, brechas y tensiones entre la prescripción normativa y los resultados empíricos, usando la API de OpenAI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#f4f5f7",
        }}
      >
        {children}
      </body>
    </html>
  );
}
