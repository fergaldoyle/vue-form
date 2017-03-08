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

export function removeClassWithPrefix(el, prefix) {
  var classes = el.className.split(" ").filter(function(c) {
    return c.lastIndexOf(prefix, 0) !== 0;
  });
  el.className = (classes.join(" ")).trim();
}

export function vModelValue(data) {
  if (data.model) {
    return data.model.value;
  }
  return data.directives.filter(v => v.name === 'model')[0].value;
}

export function getVModelNode(nodes) {
  const foundVnodes = [];

  function traverse(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.data) {
        if (node.data.directives) {
          const match = node.data.directives.filter(v => v.name === 'model');
          if (match.length) {
            foundVnodes.push(node);
          }
        } else if (node.data.model) {
          foundVnodes.push(node);
        }
      }
      if (node.children) {
        traverse(node.children);
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
