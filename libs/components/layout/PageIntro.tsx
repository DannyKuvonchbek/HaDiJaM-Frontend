export default function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <div className="shell">
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="page-intro-bottom">
          <span>HAUTE JOAILLERIE · SEOUL</span>
          <span />
        </div>
      </div>
    </section>
  );
}
