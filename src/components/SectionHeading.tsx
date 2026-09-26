import { Reveal } from "./Reveal";
import { Scramble } from "./Scramble";

interface Props {
  index: string;
  title: string;
  cmd: string;
}

export function SectionHeading({ index, title, cmd }: Props) {
  return (
    <Reveal className="mb-12">
      <div className="flex items-end gap-4 sm:gap-6">
        <span className="font-display text-5xl leading-none text-line2 sm:text-6xl">{index}</span>
        <h2 className="font-display text-4xl leading-none text-phos sm:text-6xl">
          <Scramble text={title} />
        </h2>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs tracking-wider text-dim">
        <span className="shrink-0">
          <span className="text-phos">$</span> {cmd}
        </span>
        <span className="h-px flex-1 bg-line" />
        <span className="hidden shrink-0 sm:inline">EOF</span>
      </div>
    </Reveal>
  );
}
