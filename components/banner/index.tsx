import { Button } from "../button";
import { InsuranceCard } from "../insuranceCard";
import styles from "./banner.module.css";
import { Marquee } from "../marquee";

export function Banner() {
  return (
    <div className="grid">
        <div className={styles.banner}>
            <h1>Health Insurance that <span className={styles.bannerSpan}>dosen&apos;t get in <Marquee /> the way.</span></h1>
        </div>
        <div className={styles.bannerLeft}>
            <div className={styles.bannerLeftInfo}>
            <p>
                Join hundreds of businesses who trust us to offer health insurance that works the way it should: affordable coverage that puts employees and their doctors in the driving seat.
            </p>
            <Button label="Get a Custom Quote Today" />
            </div>
             
        </div>
        <div className={styles.bannerRight}>
            <InsuranceCard 
                image={[
                    "/images/State=1.png",
                    "/images/State=2.png",
                    "/images/State=3.png",
                    "/images/State=4.png"
                  ]}
            />
        </div>
    </div>
  );
}