---
name: sync-custom-css-theme
description: Create paste-ready custom CSS themes for the Thunfisch Sync client. Use when the user describes a visual theme, wants custom colors, backgrounds, images, fonts, UI restyling, or asks for CSS that can be stored in localStorage as cssStyle.
---

# Custom CSS Theme

Create one pure CSS theme for the Thunfisch Sync web client. The user describes the desired look; translate it into CSS that overrides the existing UI.

## Output

Return the JavaScript snippet first:

```js
localStorage.setItem("cssStyle", `CSS_HERE`)
```

Put the CSS inside the template literal. Escape backticks in CSS URLs or comments if needed.

After the snippet, add a short step-by-step user guide:

1. Open Thunfisch Sync in the browser.
2. Open DevTools with F12 or Ctrl+Shift+I / Cmd+Option+I.
3. Open the Console tab.
4. If the browser blocks pasting, type the shown confirmation text such as `allow pasting` and press Enter.
5. Paste the snippet, press Enter, then reload the page.

Keep the guide short and practical. Do not add extra explanations unless the user asks.

Use plain CSS only. No SCSS variables, nesting, mixins, build steps, or external scripts. Images and fonts are allowed through CSS URLs:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap");

@font-face {
    font-family: "Theme Font";
    src: url("https://example.com/font.woff2") format("woff2");
}

body {
    background-image: url("https://example.com/background.jpg") !important;
}
```

Every CSS declaration in normal rules must end with `!important` so the injected style wins. `@import`, `@font-face src`, and keyframe steps cannot always use `!important`; use it everywhere CSS permits it.

## App Behavior

The client reads `localStorage.getItem("cssStyle")` on startup and injects that string into a `<style>` element in `<head>`. The user will paste the returned snippet into the browser console, then reload.

## Default Look

The default UI is a dark YouTube-sync interface:

- Body: `#0C0C0C` background, `#F1F1F1` text, Poppins font, 14px text.
- Accent: bright blue `#00A6FB`.
- Surfaces: translucent dark panels using rgba blacks/greys.
- Header: centered max width 1600px, logo left, search centered, viewer count right.
- Main layout: player/info column at 75%, queue column at 25%; stacks on screens below 1140px.
- Corners: mostly 8px for panels/videos/player, 25px pills for search/buttons, circular avatars/icons.
- Fonts: Poppins for UI, Roboto Mono for timestamps, IcoMoon for icons.

## DOM Blueprint

Use this as the mental model for selectors and layout. Runtime variants can add player overlays, search results, drag previews, PiP mode, and state classes.

```html
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Thunfisch Sync</title>
</head>
<body>
  <div id="root">
    <header>
      <a href="/" class="logo">
        <img src="/icons/favicon-96x96.png">SYNC
      </a>
      <div class="spacer grow"></div>
      <div class="search">
        <input class="search-input" placeholder="Suchen" value="">
        <button class="search-button icon-search"></button>
        <div class="search-results hide"></div>
      </div>
      <div class="viewer">
        <span class="icon-circle-user"></span>
        <span class="icon-circle-user"></span>
      </div>
    </header>
    <main>
      <div>
        <div class="player">
          <div class="indicators"></div>
          <div class="player-iframe"></div>
        </div>
        <div class="information">
          <div class="information-top">
            <span class="information-top-title">Video title</span>
            <span class="information-top-views">Video click count</span>
          </div>
          <div class="spacer grow"></div>
          <div class="information-bottom">
            <a class="information-bottom-channel" href="#" target="_blank">
              <img src="#">
              <div>
                <span class="information-bottom-channel-name">Channel name</span>
                <span class="information-bottom-channel-subscribers">Subscriber count</span>
              </div>
            </a>
            <div class="information-bottom-buttons">
              <a class="icon-external-link" href="#" target="_blank">Link to youtube</a>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="queue">
          <div class="queue-controls">
            <p>Warteschlange</p>
            <div class="spacer grow"></div>
            <button class="icon-trash"></button>
            <button class="icon-shuffle"></button>
          </div>
          <div class="queue-list">
            <div class="video" draggable="true">
              <div class="video-thumbnail">
                <img class="video-thumbnail-image" src="#">
                <span class="video-thumbnail-duration">Video duration</span>
              </div>
              <div class="video-info">
                <span class="video-info-title">Video title</span>
                <span class="video-info-channel">Channel name</span>
                <div class="spacer grow"></div>
                <div class="video-info-buttons">
                  <button class="video-info-thumbnail-button icon-play"></button>
                  <button class="video-info-thumbnail-button icon-trash"></button>
                  <button class="video-info-thumbnail-button icon-double-arrow-up"></button>
                  <button class="video-info-thumbnail-button icon-double-arrow-up reverse-icon"></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

## Main Structure

The page is one centered app shell, not separate pages:

- `body`: global canvas. Put full-page colors, gradients, background images, font family, and text color here.
- `#root`: full-width React mount. Usually leave sizing alone.
- `header`: top navigation row, max-width 1600px, 64px tall, horizontally centered. Contains logo, flexible spacer, centered search, and viewer count.
- `.logo`: left brand link. It is a flex row with the tuna icon image and `SYNC` text. `.logo .icon-power-off` appears only when disconnected.
- `main`: content shell, max-width 1600px, centered, two columns with 20px gap.
- `main > div:nth-child(1)`: left content column. Width 75%, vertical stack containing `.player` then `.information`.
- `main > div:nth-child(2)`: right sidebar. Width 25%, contains `.queue`.
- `.spacer.grow`: flex filler used to push controls apart. Do not give it visible styling unless intentionally debugging layout.
- `.spacer.one`, `.flex-one`, `.flex-fill`: helper flex classes; treat as invisible layout utilities.

On tablet width, `main` becomes one column: player/information first, queue below. On small screens, the search bar drops under the header.

## Search

- `.search`: search container, a rounded bordered pill in the header. It is absolutely centered inside `header`, so wide themes must avoid making it collide with `.logo` or `.viewer`.
- `.search-input`: left/flexible text input inside `.search`. It owns most of the width and inherits the pill's left curve.
- `.search-clear`: optional middle clear button shown when there is input; its `::after` contains the x icon.
- `.search-button`: right search submit button with the `icon-search` pseudo-icon and the pill's right curve.
- `.search-results`: dropdown panel below `.search`, centered with `left: 50%` and `transform: translateX(-50%)`. Put result-panel backgrounds, borders, shadows, and blur here.
- `.search-results.hide`: hidden state.
- `.search-results > button`: simple dropdown action buttons.

## Video Cards

Both search results and queue items use `.video` classes:

- `.video`: 105px horizontal row card. Left side is thumbnail, right side is title/channel/actions. In queue it is draggable; in search results it is a result row.
- `.video.is-dragging`: dragged queue item state.
- `.video.drop-above`, `.video.drop-below`: drag insertion markers.
- `.video-thumbnail`: left thumbnail wrapper, about 45% width and max 150px.
- `.video-thumbnail-image`: thumbnail image, fills the wrapper with `object-fit: cover`.
- `.video-thumbnail-duration`: duration badge pinned to bottom-right of the thumbnail.
- `.video-info`: right text/action column, about 55% width.
- `.video-info-title`: title, normally medium weight and line-clamped to avoid breaking row height.
- `.video-info-channel`: channel text, lighter grey, one line.
- `.video-info-buttons`: bottom action button row, pushed down by `.spacer.grow`.
- `.video-info-thumbnail-button`: small square icon action buttons for play, add, delete, or move.
- `.reverse-icon::before`: rotated icon used for move-to-bottom.

## Player

- `.player`: 16:9 grid container. All direct children share the same grid cell so iframe, overlays, indicators, mute layer, and ambilight can stack.
- `.player-iframe`: embedded YouTube iframe wrapper, full size, rounded corners, clipped overflow.
- `.player-iframe iframe`: actual iframe; preserve positioning unless intentionally changing video crop.
- `.player-mute`: full-player click overlay shown when browser autoplay requires unmute.
- `.player-pip`: full-player message shown when video plays in picture-in-picture instead of inline.
- `.player-ambilight`: blurred layer behind the video; good target for glow intensity, saturation, or disabling glow.
- `.overlay`: full-player controls overlay stacked over iframe, bottom-aligned, with a dark bottom gradient by default.
- `.indicators`: full-player indicator layer above iframe.
- `.indicator-playing`, `.indicator-rewind`, `.indicator-forward`: circular feedback bubbles positioned center, left, and right.

## Player Controls

- `.player-overlay-timeline`: top row inside `.overlay`, above the bottom control buttons.
- `.player-overlay-timeline-tooltip`: small absolute hover time tooltip above the slider.
- `.player-overlay-control`: bottom control bar with icon buttons, volume, timestamp, and right-side actions.
- `.player-overlay-control button`: transparent icon controls.
- `.player-overlay-control-timestamp`: current/duration timestamp, uses mono font.
- `.player-overlay-control-volume`: volume icon plus compact volume slider.
- `.range-slider`: shared slider track from `react-range-slider-input`; used by timeline, volume, and speed.
- `.range-slider__thumb[data-lower]`: hidden lower thumb.
- `.range-slider__thumb[data-upper]`: visible thumb.
- `.range-slider__range`: active slider progress.

## Player Options

- `.player-overlay-options`: settings panel.
- `.player-overlay-options-speed`: speed slider row.
- `.player-overlay-options-speed span`: displayed speed value.
- `.toggle`: custom toggle shell.
- `.toggle input`: hidden checkbox.
- `.toggle span`: toggle track.
- `.toggle span::before`: toggle knob.
- `.toggle input:checked + span`: enabled track.
- `.toggle input:checked + span::before`: enabled knob position.

## Information Panel

- `.information`: metadata panel directly under the player. It is a vertical flex card with title/views at top and channel/actions at bottom.
- `.information-top`: title block.
- `.information-top-title`: video title, large text, max two lines.
- `.information-top-views`: view count below title.
- `.information-bottom`: bottom row with channel on the left and buttons on the right; stacks on phones.
- `.information-bottom-channel`: channel link row with avatar and channel text.
- `.information-bottom-channel img`: circular channel avatar.
- `.information-bottom-channel-name`: channel name, one line.
- `.information-bottom-channel-subscribers`: subscriber count below channel name.
- `.information-bottom-buttons`: external/action button group aligned right.
- `.information-bottom-buttons a`, `.information-bottom-buttons button`: pill buttons with optional icon pseudo-elements.

## Queue

- `.queue`: right-side sidebar panel. It fills the available column height and contains controls above a scrollable list.
- `.queue-controls`: top row inside queue with heading left and clear/shuffle buttons right.
- `.queue-controls p`: queue heading.
- `.queue-controls button`: circular clear/shuffle icon buttons.
- `.queue-list`: vertical list of `.video` rows. On desktop it scrolls inside the queue panel; on tablet/mobile it expands naturally.
- `.queue-list .video:hover`: queue item hover/drag affordance.
- `.draggable`: fixed full-screen drag layer used during queue drag.
- `.draggable-preview`: floating copy of the dragged video row.
- `.draggable-thumbnail`, `.draggable-thumbnail img`, `.draggable-thumbnail span`: preview thumbnail and duration.
- `.draggable-info`, `.draggable-title`, `.draggable-channel`: preview text.

## Viewer And PiP

- `.viewer`: viewer count pill on the right side of the header.
- `.viewer span`: viewer icon/count. The first span can contain a number; additional spans can be plain user icons.
- `#pip`: picture-in-picture root.
- `html:has(#pip)`, `body:has(#pip)`: PiP page sizing.
- `#pip .player`, `#pip .player-overlay`, `#pip .player-iframe`: fullscreen PiP player.

## Icons

Icon classes use IcoMoon pseudo-elements. Do not replace their `content` unless the user asks for different symbols.

Common icon classes:

- `.icon-search`, `.icon-x`, `.icon-play`, `.icon-pause`, `.icon-plus`, `.icon-trash`, `.icon-shuffle`
- `.icon-volume-high`, `.icon-volume-low`, `.icon-volume-off`, `.icon-volume-x`
- `.icon-settings`, `.icon-lock`, `.icon-lock-open`, `.icon-fullscreen`
- `.icon-picture-in-picture`, `.icon-external-link`, `.icon-circle-user`, `.icon-power-off`

If changing icon fonts or button fonts, keep pseudo-elements on the icon font and regular labels on the UI font:

```css
.icon-play::before,
.icon-search::before,
.viewer span::before {
    font-family: "IcoMoon" !important;
}
```

## Responsive Breakpoints

Mirror these breakpoints when needed:

- `1140px`: main layout stacks; queue list stops being fixed-height scroll.
- `700px`: header search moves below header.
- `435px`: search and video cards shrink to mobile width; information bottom stacks.

Use media queries for layout-sensitive themes. Keep the player usable, keep controls visible, and avoid covering the search dropdown or queue actions with decorative backgrounds.
