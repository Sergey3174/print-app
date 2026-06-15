import printingAnimation from "./Printing.json";
import "@lottiefiles/lottie-player";

export default function PrintingAnimation() {
  return (
    <div
      style={{
        width: "clamp(120px, 28vh, 600px)",
        height: "clamp(120px, 28vh, 600px)",
        margin: "0 auto",
      }}
    >
      {/* `lottie-player` is a custom web component registered by the package above. */}
      {/* @ts-expect-error custom element is provided at runtime */}
      <lottie-player
        src={printingAnimation}
        background="transparent"
        speed="1"
        style={{ width: "100%", height: "100%" }}
        loop={true}
        autoplay
      />
    </div>
  );
}
