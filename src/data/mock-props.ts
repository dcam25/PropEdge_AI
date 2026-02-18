import type { Prop } from "@/types";
import { generateMockProps, SPORT_LABELS as GEN_LABELS } from "./mock-generator";

/** Generate 200 mock props (deterministic via seed for SSR hydration safety) */
export const MOCK_PROPS: Prop[] = generateMockProps(2000, 42);

export const SPORT_LABELS = GEN_LABELS;
