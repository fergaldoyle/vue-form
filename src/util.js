export function getClasses(classConfig, state) {
    return {
      [classConfig.dirty]: state.$dirty,
      [classConfig.pristine]: state.$pristine,
      [classConfig.valid]: state.$valid,
      [classConfig.invalid]: state.$invalid,
      [classConfig.touched]: state.$touched,
      [classConfig.untouched]: state.$untouched,
      [classConfig.focused]: state.$focused,
      [classConfig.pending]: state.$pending,
      [classConfig.submitted]: state.$submitted,
    };
}

export function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
}

export function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

export function vModelValue(data) {
  if (data.model) {
    return data.model.value;
  }
  return data.directives.filter(v => v.name === 'model')[0].value;
}

export function getVModelAndLabel(nodes, config) {
  const foundVnodes = {
    vModel: [],
    label: null,
    messages: null
  };

  if(!nodes) {
    return foundVnodes;
  }

  function traverse(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];

      if(node.componentOptions) {
        if(node.componentOptions.tag === hyphenate(config.messagesComponent)) {
          foundVnodes.messages = node;
        }    
      }

      if(node.tag === 'label' && !foundVnodes.label) {
        foundVnodes.label = node;
      }

      if (node.data) {
        if (node.data.model) {
          // model check has to come first. If a component has
          // a directive and v-model, the directive will be in .directives
          // and v-modelstored in .model
          foundVnodes.vModel.push(node);
        } else if (node.data.directives) {
          const match = node.data.directives.filter(v => v.name === 'model');
          if (match.length) {
            foundVnodes.vModel.push(node);
          }
        }
      }
      if (node.children) {
        traverse(node.children);
      } else if (node.componentOptions && node.componentOptions.children) {
        traverse(node.componentOptions.children);
      }
    }
  }

  traverse(nodes);

  return foundVnodes;
}

export function getName(vnode) {
  if(vnode.data && vnode.data.attrs && vnode.data.attrs.name) {
    return vnode.data.attrs.name;
  } else if (vnode.componentOptions && vnode.componentOptions.propsData && vnode.componentOptions.propsData.name) {
    return vnode.componentOptions.propsData.name;
  }
}

const hyphenateRE = /([^-])([A-Z])/g;
export function hyphenate (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
}

export function randomId() {
  return Math.random().toString(36).substr(2, 10);
}

// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export function isShallowObjectDifferent(a, b) {
  let aValue = '';
  let bValue = '';
  Object.keys(a).sort().filter(v => typeof a[v] !== 'function').forEach(v => aValue += a[v]);
  Object.keys(b).sort().filter(v => typeof a[v] !== 'function').forEach(v => bValue += b[v]);
  return aValue !== bValue;
}
