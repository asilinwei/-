# Better-CSS
The tool about CSS, including CSS serialize and CSS selector name escape(The polyfill of [CSS.escape](https://drafts.csswg.org/cssom/#the-css.escape%28%29-method)).  

## Method
```js
css.serialize(index, [format=false])
```  
Serialize the style sheet by index.  
  
Arguments:  
```index```(number): The index of the style sheet in document.  
```[format=false]```(boolean): Whether to format the style sheet.  

Return:   
(Object): The result of serialize.  
  
Example:    

```css
/* The first style sheet in the document. */
body, div {
    margin: 20px;
    padding: 20px;
}
div {
    background: red;
}
```
```js
css.serialize(0)
// => 
{
    '0': { 
        names: ['margin', 'padding'], 
        selectorText: 'body', 
        margin: '20px', 
        padding: '20px', 
        cssText: 'body { margin: 20px; padding: 20px; }' 
	},

    '1': { 
        names: ['margin', 'padding', 'background'], 
        selectorText: 'div', 
        margin: '20px', 
        padding: '20px', 
        background: 'red', 
        cssText: 'div { margin: 20px; padding: 20px; background: red; }' 
    },
    
    length: 2
}
```