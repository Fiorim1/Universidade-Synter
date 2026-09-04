import "../styles/Hero.css";

function Hero({
  one = "Seja bem-vindo(a) à nossa",
  two = "Universidade Synter",
  three = "Aqui você irá encontrar tudo sobre a Synter"
}) {
  return (
    <div className="hero-all">
      <h4>{one}</h4>
      <h2>{two}</h2>
      <p>{three}</p>
    </div>
  );
}

export default Hero;