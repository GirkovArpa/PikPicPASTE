import { fs, spawn } from '@sys';
import { home } from '@env';

export class Square extends Element {
  constructor(props) {
    super();
    this.app = props.app;
    this.isHamburgerMenu = props.isHamburgerMenu;

    if (!this.isHamburgerMenu) {
      this.folder = props.folder.replace(/[\\/]+$/, '');

      this.imagePaths = fs.$readdir(this.folder)
        .filter(({ name }) => /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(name))
        .map(({ name }) => `${this.folder}/${name}`);

      this.images = [];
    }
  }

  async componentDidMount() {
    if (this.isHamburgerMenu) return;

    const images = await Promise.all(
      this.imagePaths.map(Graphics.Image.load)
    );

    this.componentUpdate({ images });
  }

  ['on click at (square)']() {
    if (this.isHamburgerMenu) return;
    if (!this.images.length) return;
    const index = ~~(Math.random() * this.images.length);
    const image = this.images[index];
    const result = Clipboard.write({ image, file: [this.imagePaths[index]] });
    console.log(result);
    console.log(Window.this.caption);

    spawn([home(['focus.exe']), Window.this.caption]);
  }

  render() {
    const style = this.isHamburgerMenu ? '' : `background-image: url("${this.imagePaths[0]}");`;
    return <div name="square" style={style} styleset={__DIR__ + "square.css#square"}></div>
  }
}