import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

function KeymanBanner() {
  const height = 240;
  const autoplay = React.useRef(
    Autoplay({
      delay: 4000, // 4 seconds between slides
      stopOnInteraction: true, // Stops if user drags or clicks controls
      stopOnMouseEnter: true, // Stops if mouse hovers over carousel
      stopOnLastSnap: false, // Keeps looping (since `loop` is true)
    })
  );
  return (
    <Carousel
      withIndicators
      withControls
      slideGap="md"
      controlsOffset="xs"
      slideSize={"90%"}
      height={height}
      emblaOptions={{
        active: true,
        loop: true,
        dragFree: false,
        align: "center",
      }}
      plugins={[autoplay.current]}
      maw={1000}
      mx="auto"
      className="  w-[90%]"
    >
      <Carousel.Slide>
        <Image
          src="/keyman_hero.jpeg"
          alt=""
          height={height}
          radius={"md"}
          fallbackSrc="/keyman_hero.jpeg"
        />
      </Carousel.Slide>
      <Carousel.Slide>
        <Image
          src="/keyman_hero.jpeg"
          alt=""
          height={height}
          radius={"md"}
          fallbackSrc="/keyman_hero.jpeg"
        />
      </Carousel.Slide>
      {/* ...other slides */}
    </Carousel>
  );
}
export default KeymanBanner;
