let treeData;

axios.get(GIST_URL).then(response => {
  treeData = response.data;
  initGame(treeData);
}).catch(error => {
  console.error("Error loading tree data:", error);
});

function initGame(data) {
  const leaves = extractLeaves(data);
  createBasket(leaves);
  drawTree(data);
}

function extractLeaves(node) {
  if (!node.children) return [node.name];
  return node.children.flatMap(extractLeaves);
}

function createBasket(leaves) {
  const container = document.getElementById('leaves');
  const shuffled = leaves.sort(() => Math.random() - 0.5);
  shuffled.forEach(name => {
    const el = document.createElement('div');
    el.classList.add('leaf');
    el.textContent = name;
    el.setAttribute('draggable', true);
    el.id = `leaf-${name}`;
    container.appendChild(el);
  });

  interact('.leaf').draggable({
    listeners: {
      move (event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  });
}

function drawTree(data) {
  const width = 800;
  const height = 400;

  const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const treeLayout = d3.tree().size([width - 40, height - 40]);
  const root = d3.hierarchy(data);
  treeLayout(root);

  svg.selectAll('line')
    .data(root.links())
    .enter()
    .append('line')
    .attr('x1', d => d.source.x + 20)
    .attr('y1', d => d.source.y + 20)
    .attr('x2', d => d.target.x + 20)
    .attr('y2', d => d.target.y + 20)
    .attr('stroke', '#555');

  svg.selectAll('circle')
    .data(root.descendants())
    .enter()
    .append('circle')
    .attr('cx', d => d.x + 20)
    .attr('cy', d => d.y + 20)
    .attr('r', 20)
    .attr('fill', d => d.children ? '#a5d6a7' : '#fff')
    .attr('stroke', '#2e7d32')
    .each(function(d) {
      if (!d.children) {
        // Drop target for leaves
        interact(this).dropzone({
          accept: '.leaf',
          ondrop(event) {
            const leafName = event.relatedTarget.textContent;
            if (leafName === d.data.name) {
              this.setAttribute('fill', '#81c784');
              event.relatedTarget.remove();
              checkVictory();
            } else {
              alert("Wrong leaf! 🌪");
            }
          }
        });
      }
    });

  svg.selectAll('text')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('x', d => d.x + 20)
    .attr('y', d => d.y + 20)
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .text(d => d.children ? d.data.name : '');
}

function checkVictory() {
  if (document.querySelectorAll('.leaf').length === 0) {
    alert("🎉 You've completed THE LARCH!");
  }
}
