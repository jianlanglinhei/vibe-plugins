import kleur from "kleur";

const prefix = kleur.gray("[vibe-plugins]");

export function info(message) {
  console.log(`${prefix} ${message}`);
}

export function warn(message) {
  console.warn(`${prefix} ${kleur.yellow(message)}`);
}

export function success(message) {
  console.log(`${prefix} ${kleur.green(message)}`);
}

export function error(message) {
  console.error(`${prefix} ${kleur.red(message)}`);
}

