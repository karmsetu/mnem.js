# Mnem JS

## A Mnemonics UI library to automatically add and handle hotkeys UI into your web apps

## Usage

### Plain HTML

```js
import { initMnemonics } from 'mnemjs';

import { initMnemonics } from '../dist/index.js';

document.addEventListener(
    'DOMContentLoaded',
    initMnemonics({
        attr: 'data-accesskey', // you can choose the attribute you want to assign
        color: '#000',
        textColor: '#fff',
        animationDuration: '0.15s',
    })
);
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
    <head>
        <script type="module" src="./script.js"></script>
    </head>
    <body>
        <button data-accesskey="b">boi</button>
        <button data-accesskey="d">doi</button>
        <button data-accesskey="c">choi</button>
        <button data-accesskey="b">boi</button>
    </body>
</html>
```

### REACT / NEXT JS

it is best to create a wrapper component and then call it in root layout file

```tsx
// app/components/wrappers/mnemonics.tsx
'use client';
import { initMnemonics } from 'mnemjs';
import { ReactNode, useEffect } from 'react';

export function UseMnemonicsWrapper({ children }: { children: ReactNode }) {
    useEffect(() => initMnemonics(), []);
    return children;
}
```

```tsx
// app/layout.tsx
import { UseMnemonicsWrapper } from '@/components/wrappers/mnemonics';
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <UseMnemonicsWrapper>{children}</UseMnemonicsWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
```

now you can assign the attributes to any element

```tsx
<Button
    variant="outline"
    size="icon"
    className="relative"
    data-accesskey={`B`}
>
```
