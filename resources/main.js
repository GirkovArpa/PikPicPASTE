import { Square } from 'square/square.js';

import moveableView from 'moveable-view.js';

export class Application extends Element {
  constructor() {
    super();

    this.folders = [];

    Window.this.on('trayiconclick', (evt) => {
      if (evt.data.buttons === 2) {
        const [sx, sy] = Window.this.box('position', 'client', 'screen');
        const menu = Element.create(
          <menu class="popup" styleset={__DIR__ + "tray/tray-menu.css#tray-menu"}>
            <li name="about">About</li>
            <hr />
            <li name="exit">Exit</li>
          </menu>
        );
        const { screenX, screenY } = evt.data;
        menu.popupAt(screenX - sx, screenY - sy, 2);
        menu.on('click', '(about)', () => Window.this.modal({ url: 'about/about.htm' }));
        menu.on('click', '(exit)', () => Window.this.close());
      }
    });
  }

  componentDidMount() {
    loadTrayIconImage('logo/16.png').then(image => {
      Window.this.trayIcon({ image });
    });

    adjustWindow({ center: true });

    moveableView('body > :first-child');

    setInterval(() => Window.this.isTopmost = true, 20);
  }

  ['on mousedown at body > :first-child']() {
    this.componentUpdate({ pressing: true });
  }

  ['on mousemove at body > :first-child']() {
    if (this.pressing) {
      this.componentUpdate({ dragging: true });
    }
  }

  ['on mouseleave at body > :first-child']() {
    this.componentUpdate({ dragging: false, pressing: false });
  }

  ['on mouseup at body > :first-child']() {
    this.componentUpdate({ pressing: false });

    if (this.dragging) {
      this.componentUpdate({ dragging: false });
      return;
    }

    const directory = Window.this
      .selectFolder({
        mode: 'open',
        caption: 'Select a folder containing images...',
      })
      ?.replace('file://', '')
      ?.replace(/.+/, (filename) => decodeURIComponent(filename));
    if (!directory) return;

    const { folders } = this;

    folders.push(directory);

    this.componentUpdate({ folders });

    this.patch(this.render());
    Window.this.update();

    this.post(() => adjustWindow({ center: false }));
  }

  render() {
    return (
      <body>
        <Square app={this} isHamburgerMenu={true} />
        {this.folders.map((folder) => <Square app={this} folder={folder} isHamburgerMenu={false} />)}
      </body>
    );
  }
}

async function loadTrayIconImage(filename) {
  try {
    // packaged
    const image = await Graphics.Image.load(`this://app/${filename}`);
    return image;
  } catch (e) {
    // local
    const image = await Graphics.Image.load(filename);
    return image;
  }
}

function adjustWindow({ center = true }) {
  const [wmin, w] = document.state.contentWidths();
  const h = document.state.contentHeight(w);
  const [x, y] = Window.this.box('position', 'client', 'monitor');
  const [sw, sh] = Window.this.screenBox('frame', 'dimension');

  if (center) {
    Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);
  } else {
    Window.this.move(x, y, w, h, true);
  }
}
