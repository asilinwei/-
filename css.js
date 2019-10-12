(function() {
		"use strict";

		var styleSheets = document.styleSheets,
		    empty = [],
		    nativeEvery = empty.every,
		    nativeForEach = empty.forEach,
		    nativeFindIndex = empty.findIndex,
		    nativeToArray = Array.from,
		    nativeCreate = Object.create,
		    nativeFreeze = Object.freeze,
		    nativeObjectKeys = Object.keys,
		    nativeObjectDefindProperty = Object.defineProperty,
		    nativeFloor = Math.floor;

		var toCamelCase = {
			'q': 'Q',
			'hz': 'Hz',
			'khz': 'kHz'
		};    

		var cssUnit = [
		    'number', 'percent', 'em', 'ex', 'ch',
		    'rem', 'vw', 'vh', 'vmin', 'vmax', 'cm',
		    'mm', 'in', 'pt', 'pc', 'px', 'Q', 'deg',
		    'grad', 'rad', 'turn', 's', 'ms', 'Hz', 'kHz',
		    'dpi', 'dpcm', 'dppx', 'fr'
		];    

		var CSSDigitalUnit = function(value, unit) {
			this.value = value;
			this.unit = unit;
		};

		CSSDigitalUnit.prototype.toString = function() {
			return this.value + this.unit;
		};

		CSSDigitalUnit.prototype.to = function(unit) {
			var key = toCamelCase.hasOwnProperty(this.unit) ? toCamelCase[this.unit] : this.unit;
			try {
				var value = CSS[key](this.value).to(unit).value;
				return new CSSDigitalUnit(value, unit.toLowerCase());
			} catch (e) {
				return null;
			}
		};


		var toInteger = function(value) {
			value = nativeFloor(value);
			return value === value ? value : 0;
		};

		var unique = function(array) {
			var set = new Set(array);
			return nativeToArray(set);
		};

		var baseEscape = function(selectorText) {
			var result = '', firstCodePoint = selectorText.codePointAt(0);
			nativeForEach.call(selectorText, function(char, index) {
				var code = char.codePointAt(0);
				if (code === 0x0000) {
					result += '\uFFFD';
				} else if (
					(code >= 0x0001 && code <= 0x001F || code === 0x007F) || 
					(index === 0 && code >= 0x0030 && code <= 0x0039) || 
					(index === 1 && firstCodePoint === 0x002D && code >= 0x0030 && code <= 0x0039)
				) {
					result += `\\${code.toString(16)} `;
				} else if (
					code === 0x002D && 
					selectorText.length === 1 && 
					index === 0
				) {
					result += `\\${char}`;
				} else if (
					code >= 0x0080 || 
					code === 0x002D || 
					code === 0x005F || 
					code >= 0x0030 && code <= 0x0039 || 
					code >= 0x0041 && code <= 0x005A || 
					code >= 0x0061 && code <= 0x007A
				) {
					result += char;
				} else {
					result += `\\${char}`;
				}
			});
			return result;
		};

		var baseSerialize = function(sheet, format) {
			var result = nativeCreate(null), index = -1,
			    cssText, names;
			(result.length = 0, nativeForEach).call(sheet.cssRules, function(rule) {
				[rule.selectorText, rule.style.cssText].forEach(function(text, index) {
					empty[index] = text.replace.apply(text, index ? [/\s/g, ''] : [/,\s/g, ',']);
				});
				(cssText = empty[1], unique(empty[0].split(','))).forEach(function(selectorText) {
					if (
						nativeEvery.call(result, function(obj) { 
							return obj.selectorText !== selectorText; 
						})
					) {
						(result[++index] = nativeCreate(null)).names = [];
						result[index].selectorText = selectorText;
						result.length += 1;
					}
					var findIndex = nativeFindIndex.call(result, function(obj) {
						return obj.selectorText === selectorText;
					});
					rule = result[findIndex];
					cssText.replace(/([a-z]+(?:-[a-z]+)*):([^:;]+);/g, function($0, $1, $2) {
						$1 = (
							(names = rule.names).indexOf($1) < 0 && names.push($1), 
							$1
						)
						.replace(/-([a-z])/g, function($0, $1) {
							return $1.toUpperCase();
						});
						rule[$1] = $2;
					});
				});
			});
			nativeForEach.call(result, function(rule) {
				rule.cssText = `${rule.selectorText} {${format ? '\n' : ' '}${
					(function() {
						var str = '';
						nativeObjectKeys(rule).forEach(function(key) {
							if (key === 'selectorText' || key === 'names') {
								return;
							}
							str += `${format ? ' '.repeat(4) : ''}${
								key.replace(/[A-Z]/g, function($0) {
									return `-${$0.toLowerCase()}`;
								})
							}: ${rule[key]};${format ? '\n' : ' '}`;
						});
						return str;
					})()
				}}`;
				[rule, rule.names].forEach(function(obj) {
					nativeFreeze(obj);
				});
			});
			['type', 'href'].forEach(function(property) {
				nativeObjectDefindProperty(result, property, {
					get: function() {
						return sheet[property];
					}
				});
			});
			return nativeFreeze(result);
		};

		var escape = function(selectorText) {
			if (selectorText === undefined || selectorText.length === 0) {
				return '';
			}
			selectorText = String(selectorText);
			return baseEscape(selectorText);
		};

		var serialize = function(index, format) {
			if (index === undefined) {
				index = 0;
			}
			index = toInteger(index);
			if (!styleSheets[index]) {
				return null;
			}
			return baseSerialize(styleSheets[index], format);
		};

		var css = nativeCreate(null);
		css.escape = escape;
		css.serialize = serialize;
		cssUnit.forEach(function(key) {
			css[key] = function(value) {
				if (value === undefined) {
					value = 0;
				}
				value = +value;
				if (value !== value) {
					value = 0;
				}
				return new CSSDigitalUnit(value, key.toLowerCase());
			};
		});
		css.version = '0.0.1';

		if (typeof window === 'object' && window.css == null) {
			window.css = nativeFreeze(css);
		}

	})();