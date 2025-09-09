import { Illo } from "../icons/Illo";
import styles from "./marquee.module.css";

export function Marquee() {
    return (
        <div className={styles.marquee + " title"}>
            <span>Marquee</span>
            <Illo />
            <span>Marquee</span>
        </div>
    )
}