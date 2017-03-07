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
    var classes = el.className.split(" ").filter(function (c) {
        return c.lastIndexOf(prefix, 0) !== 0;
    });
    el.className = (classes.join(" ")).trim();
}

export function vModelValue(data) {
  return data.directives.filter(v => v.name === 'model')[0].value;
}

export function getVModelNode(nodes) {
  let foundVnodes = [];
  const vModelNode = nodes.filter((node) => {
    if (node.data && node.data.directives) {
      const match = node.data.directives.filter(v => v.name === 'model');
      if (match.length) {
        foundVnodes.push(node);
      }
    }
  });
  return foundVnodes;
}
