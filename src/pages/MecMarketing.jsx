
import React, { useState } from "react";
import { Download } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileButton from "../components/UserProfileButton";
import Profile from "../components/Profile";

import "../styles/Videos.css";
import "../styles/DigMarketing.css";
import "../styles/DigMarketingHero.css";
import "../styles/DigMarketingMobile.css";
import "../styles/MecMarketing.css";

import imagem1 from "../assets/marketing-mecanicas/Acqua Max Escovada Banheiro.jpg";
import imagem2 from "../assets/marketing-mecanicas/Acqua Max Polida Banheiro.jpg";
import imagem3 from "../assets/marketing-mecanicas/Acqua Max Polida Externa.jpg";
import imagem4 from "../assets/marketing-mecanicas/Acqua Max Polidda Interna.jpg";
import imagem5 from "../assets/marketing-mecanicas/Aqua Max Escovada Externa.jpg";
import imagem6 from "../assets/marketing-mecanicas/Aqua Max Escovada Interna.jpg";
import imagem7 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta e Jaspe 220mm Polida.png";
import imagem8 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Chave Reta Escovada.jpg";
import imagem9 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Chave Reta Polida.jpg";
import imagem10 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Chave Reta Preta.jpg";
import imagem11 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Escovada.jpg";
import imagem12 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Polida.jpg";
import imagem13 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Quadrada Preta.jpg";
import imagem14 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Chave Reta Escovada.jpg";
import imagem15 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Chave Reta Polida.jpg";
import imagem16 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Chave Reta Preta.jpg";
import imagem17 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Escovada.jpg";
import imagem18 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Polida.jpg";
import imagem19 from "../assets/marketing-mecanicas/Banheiro Com Tranqueta Redonda Preta.jpg";
import imagem20 from "../assets/marketing-mecanicas/Barra de Apoio.jpg";
import imagem21 from "../assets/marketing-mecanicas/Ceci Escovada Hospital Com Parafuso.webp";
import imagem22 from "../assets/marketing-mecanicas/Ceci Escovada Hospital.webp";
import imagem23 from "../assets/marketing-mecanicas/Champion Escovada Banheiro.jpg";
import imagem24 from "../assets/marketing-mecanicas/Champion Escovada Chave Reta Banheiro.jpg";
import imagem25 from "../assets/marketing-mecanicas/Champion Escovada Externa.jpg";
import imagem26 from "../assets/marketing-mecanicas/Champion Escovada Interna.jpg";
import imagem27 from "../assets/marketing-mecanicas/Champion Polida Banheiro.jpg";
import imagem28 from "../assets/marketing-mecanicas/Champion Polida Chave Reta Banheiro.jpg";
import imagem29 from "../assets/marketing-mecanicas/Champion Polida Externa.jpg";
import imagem30 from "../assets/marketing-mecanicas/Champion Polida Interna.jpg";
import imagem31 from "../assets/marketing-mecanicas/Champion Preta Banheiro.jpg";
import imagem32 from "../assets/marketing-mecanicas/Champion Preta Chave Reta Banheiro.jpg";
import imagem33 from "../assets/marketing-mecanicas/Champion Preta Externa.jpg";
import imagem34 from "../assets/marketing-mecanicas/Champion Preta Interna.jpg";
import imagem35 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Escovada.jpg";
import imagem36 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Polida.jpg";
import imagem37 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Preta.jpg";
import imagem38 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Escovada.jpg";
import imagem39 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Polida.jpg";
import imagem40 from "../assets/marketing-mecanicas/Externa Com Cilindro Europeu Quadrada Preta.jpg";
import imagem41 from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Escovada.jpg";
import imagem42 from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Polida.jpg";
import imagem43 from "../assets/marketing-mecanicas/Externa Rolete Roseta Quadrada Preta.jpg";
import imagem44 from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Escovada.jpg";
import imagem45 from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Polida.jpg";
import imagem46 from "../assets/marketing-mecanicas/Externa Rolete Roseta Redonda Preta.jpg";
import imagem47 from "../assets/marketing-mecanicas/Glorian Polida Banheiro.jpg";
import imagem48 from "../assets/marketing-mecanicas/Glorian Polida Chave Reta Banheiro.jpg";
import imagem49 from "../assets/marketing-mecanicas/Glorian Polida Chave Reta Roseta Quadrada Banheiro.jpg";
import imagem50 from "../assets/marketing-mecanicas/Glorian Polida Externa.jpg";
import imagem51 from "../assets/marketing-mecanicas/Glorian Polida Interna.jpg";
import imagem52 from "../assets/marketing-mecanicas/Glorian Polida Roseta Quadrada Banheiro.jpg";
import imagem53 from "../assets/marketing-mecanicas/Glorian Polida Roseta Quadrada Externa.jpg";
import imagem54 from "../assets/marketing-mecanicas/Glorian Polida Roseta Quadrada Interna.jpg";
import imagem55 from "../assets/marketing-mecanicas/Glorian Preta Banheiro.jpg";
import imagem56 from "../assets/marketing-mecanicas/Glorian Preta Chave Reta Banheiro.jpg";
import imagem57 from "../assets/marketing-mecanicas/Glorian Preta Chave Reta Roseta Quadrada Banheiro.jpg";
import imagem58 from "../assets/marketing-mecanicas/Glorian Preta Externa.jpg";
import imagem59 from "../assets/marketing-mecanicas/Glorian Preta Interna.jpg";
import imagem60 from "../assets/marketing-mecanicas/Glorian Preta Roseta Quadrada Banheiro.jpg";
import imagem61 from "../assets/marketing-mecanicas/Glorian Preta Roseta Quadrada Externa.jpg";
import imagem62 from "../assets/marketing-mecanicas/Glorian Preta Roseta Quadrada Interna.jpg";
import imagem63 from "../assets/marketing-mecanicas/Gol Polida Roseta Espelho Banheiro.jpg";
import imagem64 from "../assets/marketing-mecanicas/Gol Polida Roseta Espelho Externa.jpg";
import imagem65 from "../assets/marketing-mecanicas/Gol Polida Roseta Espelho Interna.jpg";
import imagem66 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Banheiro.jpg";
import imagem67 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Com Parafuso Banheiro.jpg";
import imagem68 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Com Parafuso Externa.jpg";
import imagem69 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Com Parafuso Interna.jpg";
import imagem70 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Externa.jpg";
import imagem71 from "../assets/marketing-mecanicas/Gol Polida Roseta Redonda Interna.jpg";
import imagem72 from "../assets/marketing-mecanicas/Gol Preta Roseta Espelho Banheiro.jpg";
import imagem73 from "../assets/marketing-mecanicas/Gol Preta Roseta Espelho Externa.jpg";
import imagem74 from "../assets/marketing-mecanicas/Gol Preta Roseta Redonda Banheiro.jpg";
import imagem75 from "../assets/marketing-mecanicas/Gol Preta Roseta Redonda Com Parafuso Banheiro.jpg";
import imagem76 from "../assets/marketing-mecanicas/Gol Preta Roseta Redonda Com Parafuso Externa.jpg";
import imagem77 from "../assets/marketing-mecanicas/Gol Preta Roseta Redonda Com Parafuso Interna.jpg";
import imagem78 from "../assets/marketing-mecanicas/Gol preta Roseta Redonda Externa.jpg";
import imagem79 from "../assets/marketing-mecanicas/Gol Preta Roseta Redonda Interna.jpg";
import imagem80 from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Escovada.jpg";
import imagem81 from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Polida.jpg";
import imagem82 from "../assets/marketing-mecanicas/Interna Com Chave Dobrável E COncha Stand Preta.jpg";
import imagem83 from "../assets/marketing-mecanicas/Interna Com Jaspe 220mm Polida.jpg";
import imagem84 from "../assets/marketing-mecanicas/Interna Com Jaspe 220mm Preta.jpg";
import imagem85 from "../assets/marketing-mecanicas/Luck Escovada Banheiro.jpg";
import imagem86 from "../assets/marketing-mecanicas/Luck Escovada Externa.jpg";
import imagem87 from "../assets/marketing-mecanicas/Luck Escovada Interna.jpg";
import imagem88 from "../assets/marketing-mecanicas/Luck Polida Banheiro.jpg";
import imagem89 from "../assets/marketing-mecanicas/Luck Polida Externa.jpg";
import imagem90 from "../assets/marketing-mecanicas/Luck Polida Interna.jpg";
import imagem91 from "../assets/marketing-mecanicas/Luck Preta Banheiro.jpg";
import imagem92 from "../assets/marketing-mecanicas/Luck Preta Externa.jpg";
import imagem93 from "../assets/marketing-mecanicas/Luck Preta Interna.jpg";
import imagem94 from "../assets/marketing-mecanicas/Marina Preta Chave Reta Roseta Redonda Banheiro.jpg";
import imagem95 from "../assets/marketing-mecanicas/Marine Color Escovada Chave reta Roseta Quadrada Banheiro.jpg";
import imagem96 from "../assets/marketing-mecanicas/Marine Color Escovada Chave Reta Roseta Redonda Banheiro.jpg";
import imagem97 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Quadrada Banheiro.jpg";
import imagem98 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Quadrada Externa.jpg";
import imagem99 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Quadrada Interna.jpg";
import imagem100 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Redonda Banheiro.jpg";
import imagem101 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Redonda Externa.jpg";
import imagem102 from "../assets/marketing-mecanicas/Marine Color Escovada Roseta Redonda Interna.jpg";
import imagem103 from "../assets/marketing-mecanicas/Marine Color Preta Chave reta Roseta Quadrada Banheiro.jpg";
import imagem104 from "../assets/marketing-mecanicas/Marine Color Preta Chave Reta Roseta Redonda Banheiro.jpg";
import imagem105 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Quadrada Banheiro.jpg";
import imagem106 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Quadrada Externa.jpg";
import imagem107 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Quadrada Interna.jpg";
import imagem108 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Redonda Banheiro.jpg";
import imagem109 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Redonda Externa.jpg";
import imagem110 from "../assets/marketing-mecanicas/Marine Color Preta Roseta Redonda Interna.jpg";
import imagem111 from "../assets/marketing-mecanicas/Marine Polida Banheiro.jpg";
import imagem112 from "../assets/marketing-mecanicas/Marine Polida Chave Reta Roseta Quadrada Banheiro.jpg";
import imagem113 from "../assets/marketing-mecanicas/Marine Polida Chave Reta Roseta Redonda Banheiro.jpg";
import imagem114 from "../assets/marketing-mecanicas/Marine Polida Externa.jpg";
import imagem115 from "../assets/marketing-mecanicas/Marine Polida Interna.jpg";
import imagem116 from "../assets/marketing-mecanicas/Marine Polida Roseta Quadrada Banheiro.jpg";
import imagem117 from "../assets/marketing-mecanicas/Marine Polida Roseta Quadrada Externa.jpg";
import imagem118 from "../assets/marketing-mecanicas/Marine Polida Roseta Quadrada Interna.jpg";
import imagem119 from "../assets/marketing-mecanicas/Marine Preta Banheiro.jpg";
import imagem120 from "../assets/marketing-mecanicas/Marine Preta Chave Reta Roseta Quadrada Banheiro.jpg";
import imagem121 from "../assets/marketing-mecanicas/Marine Preta Externa.jpg";
import imagem122 from "../assets/marketing-mecanicas/Marine Preta Interna.jpg";
import imagem123 from "../assets/marketing-mecanicas/Marine Preta Roseta Quadrada Banheiro.jpg";
import imagem124 from "../assets/marketing-mecanicas/Marine Preta Roseta Quadrada Externa.jpg";
import imagem125 from "../assets/marketing-mecanicas/Marine Preta Roseta Quadrada Interna.jpg";
import imagem126 from "../assets/marketing-mecanicas/Maçaneta Crispus Max.png";
import imagem127 from "../assets/marketing-mecanicas/Maçaneta Polo Max.png";
import imagem128 from "../assets/marketing-mecanicas/Maçaneta Star Max.png";
import imagem129 from "../assets/marketing-mecanicas/Navis Escovada Banheiro.jpg";
import imagem130 from "../assets/marketing-mecanicas/Navis Escovada Externa.jpg";
import imagem131 from "../assets/marketing-mecanicas/Navis Escovada Interna.jpg";
import imagem132 from "../assets/marketing-mecanicas/Navis Polida Banheiro.jpg";
import imagem133 from "../assets/marketing-mecanicas/Navis Polida Externa.jpg";
import imagem134 from "../assets/marketing-mecanicas/Navis Polida Interna.jpg";
import imagem135 from "../assets/marketing-mecanicas/Navis Preta Banheiro.jpg";
import imagem136 from "../assets/marketing-mecanicas/Navis Preta Externa.jpg";
import imagem137 from "../assets/marketing-mecanicas/Navis Preta Interna.jpg";
import imagem138 from "../assets/marketing-mecanicas/Star Escovada Banheiro.jpg";
import imagem139 from "../assets/marketing-mecanicas/Star Escovada Chave Reta Banheiro.jpg";
import imagem140 from "../assets/marketing-mecanicas/Star Escovada Externa.jpg";
import imagem141 from "../assets/marketing-mecanicas/Star Escovada Interna.jpg";
import imagem142 from "../assets/marketing-mecanicas/Star Polida Banheiro.jpg";
import imagem143 from "../assets/marketing-mecanicas/Star Polida Chave Reta Banheiro.jpg";
import imagem144 from "../assets/marketing-mecanicas/Star Polida Externa.jpg";
import imagem145 from "../assets/marketing-mecanicas/Star Polida Interna.jpg";
import imagem146 from "../assets/marketing-mecanicas/Star Preta Banheiro.jpg";
import imagem147 from "../assets/marketing-mecanicas/Star Preta Chave Reta Banheiro.jpg";
import imagem148 from "../assets/marketing-mecanicas/Star Preta Externa.jpg";
import imagem149 from "../assets/marketing-mecanicas/Star Preta Interna.jpg";
import imagem150 from "../assets/marketing-mecanicas/Stillus Polida Roseta Espelho Banheiro.jpg";
import imagem151 from "../assets/marketing-mecanicas/Stillus Polida Roseta Quadrada Banheiro.jpg";
import imagem152 from "../assets/marketing-mecanicas/Stillus Polida Roseta Redonda Banheiro.jpg";
import imagem153 from "../assets/marketing-mecanicas/Stillus Preta Roseta Quadrada Banheiro.jpg";
import imagem154 from "../assets/marketing-mecanicas/Stilus Polida Roseta Espelho Externa.jpg";
import imagem155 from "../assets/marketing-mecanicas/Stilus Polida Roseta Espelho Interna.jpg";
import imagem156 from "../assets/marketing-mecanicas/Stilus Polida Roseta Quadrada Externa.jpg";
import imagem157 from "../assets/marketing-mecanicas/Stilus Polida Roseta Quadrada Interna.jpg";
import imagem158 from "../assets/marketing-mecanicas/Stilus Polida Roseta Redonda Externa.jpg";
import imagem159 from "../assets/marketing-mecanicas/Stilus Polida Roseta Redonda Interna.jpg";
import imagem160 from "../assets/marketing-mecanicas/Stilus Preta Roseta Espelho Banheiro.jpg";
import imagem161 from "../assets/marketing-mecanicas/Stilus Preta Roseta Espelho Externa.jpg";
import imagem162 from "../assets/marketing-mecanicas/Stilus Preta Roseta Espelho Interna.jpg";
import imagem163 from "../assets/marketing-mecanicas/Stilus Preta Roseta Quadrada Externa.jpg";
import imagem164 from "../assets/marketing-mecanicas/Stilus Preta Roseta Quadrada Interna.jpg";
import imagem165 from "../assets/marketing-mecanicas/Stilus Preta Roseta Redonda Banheiro.jpg";
import imagem166 from "../assets/marketing-mecanicas/Stilus Preta Roseta Redonda Externa.jpg";
import imagem167 from "../assets/marketing-mecanicas/Stilus Preta Roseta Redonda Interna.jpg";
import imagem168 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Banheiro.png";
import imagem169 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Externa.png";
import imagem170 from "../assets/marketing-mecanicas/Máquina 40mm Quadrada Interna.png";
import imagem171 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Banheiro.png";
import imagem172 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Externa.png";
import imagem173 from "../assets/marketing-mecanicas/Máquina 40mm Redonda Interna.png";
import imagem174 from "../assets/marketing-mecanicas/Máquina 45mm Quadrada Banheiro.png";
import imagem175 from "../assets/marketing-mecanicas/Máquina 45mm Quadrada Externa.png";
import imagem176 from "../assets/marketing-mecanicas/Máquina 45mm Quadrada Interna.png";
import imagem177 from "../assets/marketing-mecanicas/Máquina 45mm Redonda Banheiro.png";
import imagem178 from "../assets/marketing-mecanicas/Máquina 45mm Redonda Externa.png";
import imagem179 from "../assets/marketing-mecanicas/Máquina 45mm Redonda Interna.png";
import imagem180 from "../assets/marketing-mecanicas/Máquina 55mm Quadrada Banheiro.png";
import imagem181 from "../assets/marketing-mecanicas/Máquina 55mm Quadrada Externa.png";
import imagem182 from "../assets/marketing-mecanicas/Máquina 55mm Quadrada Interna.png";
import imagem183 from "../assets/marketing-mecanicas/Máquina 55mm Quadrada Rolete.png";
import imagem184 from "../assets/marketing-mecanicas/Máquina 55mm Redonda Banheiro.png";
import imagem185 from "../assets/marketing-mecanicas/Máquina 55mm Redonda Externa.png";
import imagem186 from "../assets/marketing-mecanicas/Máquina 55mm Redonda Interna.png";
import imagem187 from "../assets/marketing-mecanicas/Máquina 55mm Redonda Rolete.png";

const arquivos = [
  ["Acqua Max Escovada Banheiro.jpg", imagem1],
  ["Acqua Max Polida Banheiro.jpg", imagem2],
  ["Acqua Max Polida Externa.jpg", imagem3],
  ["Acqua Max Polidda Interna.jpg", imagem4],
  ["Aqua Max Escovada Externa.jpg", imagem5],
  ["Aqua Max Escovada Interna.jpg", imagem6],
  ["Banheiro Com Tranqueta e Jaspe 220mm Polida.png", imagem7],
  ["Banheiro Com Tranqueta Quadrada Chave Reta Escovada.jpg", imagem8],
  ["Banheiro Com Tranqueta Quadrada Chave Reta Polida.jpg", imagem9],
  ["Banheiro Com Tranqueta Quadrada Chave Reta Preta.jpg", imagem10],
  ["Banheiro Com Tranqueta Quadrada Escovada.jpg", imagem11],
  ["Banheiro Com Tranqueta Quadrada Polida.jpg", imagem12],
  ["Banheiro Com Tranqueta Quadrada Preta.jpg", imagem13],
  ["Banheiro Com Tranqueta Redonda Chave Reta Escovada.jpg", imagem14],
  ["Banheiro Com Tranqueta Redonda Chave Reta Polida.jpg", imagem15],
  ["Banheiro Com Tranqueta Redonda Chave Reta Preta.jpg", imagem16],
  ["Banheiro Com Tranqueta Redonda Escovada.jpg", imagem17],
  ["Banheiro Com Tranqueta Redonda Polida.jpg", imagem18],
  ["Banheiro Com Tranqueta Redonda Preta.jpg", imagem19],
  ["Barra de Apoio.jpg", imagem20],
  ["Ceci Escovada Hospital Com Parafuso.webp", imagem21],
  ["Ceci Escovada Hospital.webp", imagem22],
  ["Champion Escovada Banheiro.jpg", imagem23],
  ["Champion Escovada Chave Reta Banheiro.jpg", imagem24],
  ["Champion Escovada Externa.jpg", imagem25],
  ["Champion Escovada Interna.jpg", imagem26],
  ["Champion Polida Banheiro.jpg", imagem27],
  ["Champion Polida Chave Reta Banheiro.jpg", imagem28],
  ["Champion Polida Externa.jpg", imagem29],
  ["Champion Polida Interna.jpg", imagem30],
  ["Champion Preta Banheiro.jpg", imagem31],
  ["Champion Preta Chave Reta Banheiro.jpg", imagem32],
  ["Champion Preta Externa.jpg", imagem33],
  ["Champion Preta Interna.jpg", imagem34],
  ["Externa Com Cilindro Europeu Escovada.jpg", imagem35],
  ["Externa Com Cilindro Europeu Polida.jpg", imagem36],
  ["Externa Com Cilindro Europeu Preta.jpg", imagem37],
  ["Externa Com Cilindro Europeu Quadrada Escovada.jpg", imagem38],
  ["Externa Com Cilindro Europeu Quadrada Polida.jpg", imagem39],
  ["Externa Com Cilindro Europeu Quadrada Preta.jpg", imagem40],
  ["Externa Rolete Roseta Quadrada Escovada.jpg", imagem41],
  ["Externa Rolete Roseta Quadrada Polida.jpg", imagem42],
  ["Externa Rolete Roseta Quadrada Preta.jpg", imagem43],
  ["Externa Rolete Roseta Redonda Escovada.jpg", imagem44],
  ["Externa Rolete Roseta Redonda Polida.jpg", imagem45],
  ["Externa Rolete Roseta Redonda Preta.jpg", imagem46],
  ["Glorian Polida Banheiro.jpg", imagem47],
  ["Glorian Polida Chave Reta Banheiro.jpg", imagem48],
  ["Glorian Polida Chave Reta Roseta Quadrada Banheiro.jpg", imagem49],
  ["Glorian Polida Externa.jpg", imagem50],
  ["Glorian Polida Interna.jpg", imagem51],
  ["Glorian Polida Roseta Quadrada Banheiro.jpg", imagem52],
  ["Glorian Polida Roseta Quadrada Externa.jpg", imagem53],
  ["Glorian Polida Roseta Quadrada Interna.jpg", imagem54],
  ["Glorian Preta Banheiro.jpg", imagem55],
  ["Glorian Preta Chave Reta Banheiro.jpg", imagem56],
  ["Glorian Preta Chave Reta Roseta Quadrada Banheiro.jpg", imagem57],
  ["Glorian Preta Externa.jpg", imagem58],
  ["Glorian Preta Interna.jpg", imagem59],
  ["Glorian Preta Roseta Quadrada Banheiro.jpg", imagem60],
  ["Glorian Preta Roseta Quadrada Externa.jpg", imagem61],
  ["Glorian Preta Roseta Quadrada Interna.jpg", imagem62],
  ["Gol Polida Roseta Espelho Banheiro.jpg", imagem63],
  ["Gol Polida Roseta Espelho Externa.jpg", imagem64],
  ["Gol Polida Roseta Espelho Interna.jpg", imagem65],
  ["Gol Polida Roseta Redonda Banheiro.jpg", imagem66],
  ["Gol Polida Roseta Redonda Com Parafuso Banheiro.jpg", imagem67],
  ["Gol Polida Roseta Redonda Com Parafuso Externa.jpg", imagem68],
  ["Gol Polida Roseta Redonda Com Parafuso Interna.jpg", imagem69],
  ["Gol Polida Roseta Redonda Externa.jpg", imagem70],
  ["Gol Polida Roseta Redonda Interna.jpg", imagem71],
  ["Gol Preta Roseta Espelho Banheiro.jpg", imagem72],
  ["Gol Preta Roseta Espelho Externa.jpg", imagem73],
  ["Gol Preta Roseta Redonda Banheiro.jpg", imagem74],
  ["Gol Preta Roseta Redonda Com Parafuso Banheiro.jpg", imagem75],
  ["Gol Preta Roseta Redonda Com Parafuso Externa.jpg", imagem76],
  ["Gol Preta Roseta Redonda Com Parafuso Interna.jpg", imagem77],
  ["Gol preta Roseta Redonda Externa.jpg", imagem78],
  ["Gol Preta Roseta Redonda Interna.jpg", imagem79],
  ["Interna Com Chave Dobrável E COncha Stand Escovada.jpg", imagem80],
  ["Interna Com Chave Dobrável E COncha Stand Polida.jpg", imagem81],
  ["Interna Com Chave Dobrável E COncha Stand Preta.jpg", imagem82],
  ["Interna Com Jaspe 220mm Polida.jpg", imagem83],
  ["Interna Com Jaspe 220mm Preta.jpg", imagem84],
  ["Luck Escovada Banheiro.jpg", imagem85],
  ["Luck Escovada Externa.jpg", imagem86],
  ["Luck Escovada Interna.jpg", imagem87],
  ["Luck Polida Banheiro.jpg", imagem88],
  ["Luck Polida Externa.jpg", imagem89],
  ["Luck Polida Interna.jpg", imagem90],
  ["Luck Preta Banheiro.jpg", imagem91],
  ["Luck Preta Externa.jpg", imagem92],
  ["Luck Preta Interna.jpg", imagem93],
  ["Marina Preta Chave Reta Roseta Redonda Banheiro.jpg", imagem94],
  ["Marine Color Escovada Chave reta Roseta Quadrada Banheiro.jpg", imagem95],
  ["Marine Color Escovada Chave Reta Roseta Redonda Banheiro.jpg", imagem96],
  ["Marine Color Escovada Roseta Quadrada Banheiro.jpg", imagem97],
  ["Marine Color Escovada Roseta Quadrada Externa.jpg", imagem98],
  ["Marine Color Escovada Roseta Quadrada Interna.jpg", imagem99],
  ["Marine Color Escovada Roseta Redonda Banheiro.jpg", imagem100],
  ["Marine Color Escovada Roseta Redonda Externa.jpg", imagem101],
  ["Marine Color Escovada Roseta Redonda Interna.jpg", imagem102],
  ["Marine Color Preta Chave reta Roseta Quadrada Banheiro.jpg", imagem103],
  ["Marine Color Preta Chave Reta Roseta Redonda Banheiro.jpg", imagem104],
  ["Marine Color Preta Roseta Quadrada Banheiro.jpg", imagem105],
  ["Marine Color Preta Roseta Quadrada Externa.jpg", imagem106],
  ["Marine Color Preta Roseta Quadrada Interna.jpg", imagem107],
  ["Marine Color Preta Roseta Redonda Banheiro.jpg", imagem108],
  ["Marine Color Preta Roseta Redonda Externa.jpg", imagem109],
  ["Marine Color Preta Roseta Redonda Interna.jpg", imagem110],
  ["Marine Polida Banheiro.jpg", imagem111],
  ["Marine Polida Chave Reta Roseta Quadrada Banheiro.jpg", imagem112],
  ["Marine Polida Chave Reta Roseta Redonda Banheiro.jpg", imagem113],
  ["Marine Polida Externa.jpg", imagem114],
  ["Marine Polida Interna.jpg", imagem115],
  ["Marine Polida Roseta Quadrada Banheiro.jpg", imagem116],
  ["Marine Polida Roseta Quadrada Externa.jpg", imagem117],
  ["Marine Polida Roseta Quadrada Interna.jpg", imagem118],
  ["Marine Preta Banheiro.jpg", imagem119],
  ["Marine Preta Chave Reta Roseta Quadrada Banheiro.jpg", imagem120],
  ["Marine Preta Externa.jpg", imagem121],
  ["Marine Preta Interna.jpg", imagem122],
  ["Marine Preta Roseta Quadrada Banheiro.jpg", imagem123],
  ["Marine Preta Roseta Quadrada Externa.jpg", imagem124],
  ["Marine Preta Roseta Quadrada Interna.jpg", imagem125],
  ["Maçaneta Crispus Max.png", imagem126],
  ["Maçaneta Polo Max.png", imagem127],
  ["Maçaneta Star Max.png", imagem128],
  ["Navis Escovada Banheiro.jpg", imagem129],
  ["Navis Escovada Externa.jpg", imagem130],
  ["Navis Escovada Interna.jpg", imagem131],
  ["Navis Polida Banheiro.jpg", imagem132],
  ["Navis Polida Externa.jpg", imagem133],
  ["Navis Polida Interna.jpg", imagem134],
  ["Navis Preta Banheiro.jpg", imagem135],
  ["Navis Preta Externa.jpg", imagem136],
  ["Navis Preta Interna.jpg", imagem137],
  ["Star Escovada Banheiro.jpg", imagem138],
  ["Star Escovada Chave Reta Banheiro.jpg", imagem139],
  ["Star Escovada Externa.jpg", imagem140],
  ["Star Escovada Interna.jpg", imagem141],
  ["Star Polida Banheiro.jpg", imagem142],
  ["Star Polida Chave Reta Banheiro.jpg", imagem143],
  ["Star Polida Externa.jpg", imagem144],
  ["Star Polida Interna.jpg", imagem145],
  ["Star Preta Banheiro.jpg", imagem146],
  ["Star Preta Chave Reta Banheiro.jpg", imagem147],
  ["Star Preta Externa.jpg", imagem148],
  ["Star Preta Interna.jpg", imagem149],
  ["Stillus Polida Roseta Espelho Banheiro.jpg", imagem150],
  ["Stillus Polida Roseta Quadrada Banheiro.jpg", imagem151],
  ["Stillus Polida Roseta Redonda Banheiro.jpg", imagem152],
  ["Stillus Preta Roseta Quadrada Banheiro.jpg", imagem153],
  ["Stilus Polida Roseta Espelho Externa.jpg", imagem154],
  ["Stilus Polida Roseta Espelho Interna.jpg", imagem155],
  ["Stilus Polida Roseta Quadrada Externa.jpg", imagem156],
  ["Stilus Polida Roseta Quadrada Interna.jpg", imagem157],
  ["Stilus Polida Roseta Redonda Externa.jpg", imagem158],
  ["Stilus Polida Roseta Redonda Interna.jpg", imagem159],
  ["Stilus Preta Roseta Espelho Banheiro.jpg", imagem160],
  ["Stilus Preta Roseta Espelho Externa.jpg", imagem161],
  ["Stilus Preta Roseta Espelho Interna.jpg", imagem162],
  ["Stilus Preta Roseta Quadrada Externa.jpg", imagem163],
  ["Stilus Preta Roseta Quadrada Interna.jpg", imagem164],
  ["Stilus Preta Roseta Redonda Banheiro.jpg", imagem165],
  ["Stilus Preta Roseta Redonda Externa.jpg", imagem166],
  ["Stilus Preta Roseta Redonda Interna.jpg", imagem167],
  ["Máquina 40mm Quadrada Banheiro.png", imagem168],
  ["Máquina 40mm Quadrada Externa.png", imagem169],
  ["Máquina 40mm Quadrada Interna.png", imagem170],
  ["Máquina 40mm Redonda Banheiro.png", imagem171],
  ["Máquina 40mm Redonda Externa.png", imagem172],
  ["Máquina 40mm Redonda Interna.png", imagem173],
  ["Máquina 45mm Quadrada Banheiro.png", imagem174],
  ["Máquina 45mm Quadrada Externa.png", imagem175],
  ["Máquina 45mm Quadrada Interna.png", imagem176],
  ["Máquina 45mm Redonda Banheiro.png", imagem177],
  ["Máquina 45mm Redonda Externa.png", imagem178],
  ["Máquina 45mm Redonda Interna.png", imagem179],
  ["Máquina 55mm Quadrada Banheiro.png", imagem180],
  ["Máquina 55mm Quadrada Externa.png", imagem181],
  ["Máquina 55mm Quadrada Interna.png", imagem182],
  ["Máquina 55mm Quadrada Rolete.png", imagem183],
  ["Máquina 55mm Redonda Banheiro.png", imagem184],
  ["Máquina 55mm Redonda Externa.png", imagem185],
  ["Máquina 55mm Redonda Interna.png", imagem186],
  ["Máquina 55mm Redonda Rolete.png", imagem187]
];

const imagensMecanicas = arquivos.map(([arquivo, imagem]) => {
  const nome = arquivo.replace(/\.[^.]+$/, "");
  const titulo = nome.replace(/^Aqua Max/, "Acqua Max")
    .replace(/Polidda/g, "Polida").replace(/^Stillus/, "Stilus")
    .replace(/^Marina /, "Marine ").replace(/COncha/g, "Concha")
    .replace(/\bpreta\b/gi, "Preta").replace(/Chave reta/g, "Chave Reta")
    .replace(/(\d+)mm/g, "$1 mm");
  const categoria = /^Máquina/.test(titulo) ? "Máquinas" : /^Maçaneta/.test(titulo) ? "Maçanetas" : /^Barra/.test(titulo) ? "Acessórios" : "Fechaduras";
  return {
    id: arquivo.replace(/\.[^.]+$/, ""), arquivo, titulo, categoria, imagem,
    aplicacao: titulo.match(/\b(Interna|Externa|Banheiro|Hospital|Rolete)\b/i)?.[0] || "",
    testa: titulo.match(/\b(Quadrada|Redonda|Espelho)\b/i)?.[0] || "",
    acabamento: titulo.match(/\b(Escovada|Polida|Preta)\b/i)?.[0] || "",
    extensao: arquivo.split(".").pop(),
  };
});

function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ==========================================
// COMPONENTE DO CARD
// ==========================================

function ImagemCard({ item }) {
  return (
    <article className="video-card mec-imagem-card">
      <img
        className="video-preview mec-imagem-preview"
        src={item.imagem}
        alt={item.titulo}
        loading="lazy"
      />

      <div className="video-card-info mec-card-info">
        <h2>{item.titulo}</h2>

        <p className="mec-card-descricao">
          {item.categoria}{item.aplicacao ? ` • ${item.aplicacao}` : ""}
        </p>

        {item.acabamento && (
          <span
            className={`mec-acabamento ${normalizar(
              item.acabamento
            )}`}
          >
            <span className="mec-acabamento-cor" />
            {item.acabamento}
          </span>
        )}

        <div className="video-card-botoes mec-card-botoes">
          <a
            href={item.imagem}
            download={item.arquivo}
            className="botao-assistir mec-botao-download"
          >
            <Download size={16} />
            Baixar imagem
          </a>
        </div>
      </div>
    </article>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

function IconeSynter() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="M3 7v10l9 5 9-5V7" />
      <path d="M12 12v10" />
    </svg>
  );
}

export default function MecMarketing() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [limiteMobile, setLimiteMobile] = useState(3);
  const [pesquisa, setPesquisa] = useState("");
  const imagensFiltradas = imagensMecanicas.filter((item) =>
    normalizar(`${item.titulo} ${item.arquivo} ${item.categoria} ${item.aplicacao} ${item.testa} ${item.acabamento}`)
      .includes(normalizar(pesquisa))
  );

  const restantes = Math.max(
    0,
    imagensFiltradas.length - limiteMobile
  );

  return (
    <div className="videos-page dig-marketing-page mec-marketing-page">
      <Header />

        {/* HERO */}

        <section className="dig-marketing-hero">
        <div className="dig-marketing-hero-container">

          <div className="dig-marketing-profile">
            <UserProfileButton
              onClick={() => setProfileOpen(true)}
            />
          </div>

          <div className="dig-marketing-eyebrow">
            <IconeSynter />

            <span>
              CONTEÚDOS PARA DIVULGAÇÃO
            </span>
          </div>

          <h1 className="dig-marketing-title">
            Vídeos e Imagens de Fechaduras Mecânicas
          </h1>

          <p className="dig-marketing-description">
            Acesse vídeos e imagens das fechaduras mecânicas
            Synter para divulgação, campanhas
            e ações de marketing.
          </p>

        </div>
      </section>

        {/* CATÁLOGO */}

      <main className="videos-content">
        <div className="videos-section-title">
          <div className="videos-section-bar" />
          <h4>IMAGENS DE FECHADURAS MECÂNICAS</h4>
        </div>
        <div className="pesquisa-videos dig-marketing-search">
          <input
            type="search"
            placeholder="Pesquisar imagem ou modelo..."
            value={pesquisa}
            onChange={(evento) => {
              setPesquisa(evento.target.value);
              setLimiteMobile(3);
            }}
            aria-label="Pesquisar imagens de fechaduras mecânicas"
          />
        </div>
        {imagensFiltradas.length === 0 && (
          <p className="nenhum-video" role="status">Nenhuma imagem encontrada.</p>
        )}
        <section className="mec-catalogo">
          {/* DESKTOP */}

          <div className="dig-marketing-desktop">
            <div className="mec-imagens-grid">
              {imagensFiltradas.map((item) => (
                <ImagemCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </div>

          {/* MOBILE */}

          <div className="dig-marketing-mobile">
            <style>{`
              .mec-marketing-page button.mec-ver-mais,
              .mec-marketing-page button.mec-ver-mais:hover,
              .mec-marketing-page button.mec-ver-mais:active,
              .mec-marketing-page button.mec-ver-mais:focus {
                background: #fff !important;
                color: #111 !important;
                opacity: 1 !important;
                filter: none !important;
                -webkit-tap-highlight-color: transparent;
              }
              .mec-marketing-page button.mec-ver-mais:focus-visible {
                outline: 2px solid #999;
                outline-offset: 3px;
              }
            `}</style>
            <p role="status" style={{ color: "#aaa", fontSize: 12, margin: "0 12px 12px" }}>
              Exibindo {Math.min(limiteMobile, imagensFiltradas.length)} de {imagensFiltradas.length} imagens
            </p>
            <div className="dig-marketing-mobile-list mec-imagens-mobile">
              {imagensFiltradas
                .slice(0, limiteMobile)
                .map((item) => (
                  <ImagemCard
                    key={item.id}
                    item={item}
                  />
                ))}
            </div>

            {restantes > 0 && (
              <button
                type="button"
                className="dig-marketing-more mec-ver-mais"
                onClick={() =>
                  setLimiteMobile(
                    (anterior) => anterior + 3
                  )
                }
              >
                Ver mais imagens ({restantes} restantes)
              </button>
            )}

            {restantes === 0 &&
              limiteMobile > 3 &&
              imagensFiltradas.length > 3 && (
                <button
                  type="button"
                  className="dig-marketing-more mec-ver-mais"
                  onClick={() => setLimiteMobile(3)}
                >
                  Ver menos imagens
                </button>
              )}
          </div>
        </section>
      </main>

      <Footer />
      {profileOpen && <Profile onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
