/**
 * BoneHierarchyPanel.js - 骨骼层级面板
 *
 * 显示和管理骨骼树形结构
 */
class BoneHierarchyPanel {
  constructor(skeleton) {
    this.skeleton = skeleton;
    this.container = null;
    this.selectedBone = null;
    this.expandedBones = new Set();

    this.onBoneSelected = null;
    this.onParentChanged = null;
  }

  /**
   * 初始化 UI
   */
  init(parentSelector) {
    this.container = document.querySelector(parentSelector);
    if (!this.container) {
      console.warn(`BoneHierarchyPanel: Parent element not found: ${parentSelector}`);
      return;
    }

    this.container.innerHTML = '';
    this.container.classList.add('bone-hierarchy-panel');
    this.render();
  }

  /**
   * 渲染面板
   */
  render() {
    if (!this.container || !this.skeleton) return;

    this.container.innerHTML = '';

    // 渲染根骨骼
    this.skeleton.rootBones.forEach(bone => {
      const el = this._createBoneElement(bone, 0);
      this.container.appendChild(el);
    });
  }

  /**
   * 创建骨骼项元素
   */
  _createBoneElement(bone, level) {
    const item = document.createElement('div');
    item.className = 'bone-hierarchy-item';
    item.style.marginLeft = `${level * 16}px`;
    item.dataset.boneId = bone.id;

    // 展开/折叠按钮
    const toggle = document.createElement('span');
    toggle.className = 'bone-hierarchy-toggle';
    toggle.textContent = bone.children.length > 0 ?
      (this.expandedBones.has(bone.id) ? '▼' : '▶') : '·';
    toggle.onclick = (e) => {
      e.stopPropagation();
      if (bone.children.length > 0) {
        if (this.expandedBones.has(bone.id)) {
          this.expandedBones.delete(bone.id);
        } else {
          this.expandedBones.add(bone.id);
        }
        this.render();
      }
    };
    item.appendChild(toggle);

    // 骨骼图标
    const icon = document.createElement('span');
    icon.className = 'bone-hierarchy-item-icon';
    item.appendChild(icon);

    // 骨骼名称
    const name = document.createElement('span');
    name.className = 'bone-hierarchy-item-name';
    name.textContent = bone.name;
    item.appendChild(name);

    // 选择事件
    item.onclick = (e) => {
      e.stopPropagation();
      this.selectBone(bone.id);
    };

    // 选中样式
    if (this.selectedBone === bone.id) {
      item.classList.add('selected');
    }

    // 递归添加子骨骼
    if (bone.children.length > 0 && this.expandedBones.has(bone.id)) {
      bone.children.forEach(child => {
        const childEl = this._createBoneElement(child, level + 1);
        item.appendChild(childEl);
      });
    }

    // 右键菜单
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._showContextMenu(bone, e.clientX, e.clientY);
    });

    return item;
  }

  /**
   * 选择骨骼
   */
  selectBone(boneId) {
    this.selectedBone = boneId;
    this.skeleton.selectBone(boneId);
    this.render();

    if (this.onBoneSelected) {
      this.onBoneSelected(boneId);
    }
  }

  /**
   * 显示右键菜单
   */
  _showContextMenu(bone, x, y) {
    // 创建菜单容器
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: #2a2a2a;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 4px 0;
      z-index: 1000;
      min-width: 120px;
    `;

    // 菜单项
    const items = [
      { label: '重命名', action: () => this._renameBone(bone) },
      { label: '删除', action: () => this._deleteBone(bone) },
      { label: '显示', action: () => this._toggleVisibility(bone) },
      { label: '锁定', action: () => this._toggleLocked(bone) }
    ];

    items.forEach(item => {
      const el = document.createElement('div');
      el.style.cssText = `
        padding: 6px 12px;
        cursor: pointer;
        color: #ccc;
        font-size: 12px;
      `;
      el.textContent = item.label;
      el.onmouseover = () => el.style.backgroundColor = '#3a3a3a';
      el.onmouseout = () => el.style.backgroundColor = 'transparent';
      el.onclick = () => {
        item.action();
        document.body.removeChild(menu);
      };
      menu.appendChild(el);
    });

    document.body.appendChild(menu);

    // 点击外部关闭菜单
    const closeMenu = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener('click', closeMenu);
    };

    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  /**
   * 重命名骨骼
   */
  _renameBone(bone) {
    const newName = prompt('输入新名称:', bone.name);
    if (newName && newName.trim()) {
      bone.name = newName.trim();
      this.render();
    }
  }

  /**
   * 删除骨骼
   */
  _deleteBone(bone) {
    if (confirm(`确定要删除骨骼 "${bone.name}" 及其所有子骨骼吗?`)) {
      this.skeleton.removeBone(bone.id);
      this.render();
    }
  }

  /**
   * 切换可见性
   */
  _toggleVisibility(bone) {
    bone.visible = !bone.visible;
    bone.children.forEach(child => this._toggleVisibility(child));
    this.render();
  }

  /**
   * 切换锁定状态
   */
  _toggleLocked(bone) {
    bone.locked = !bone.locked;
    this.render();
  }

  /**
   * 清理
   */
  dispose() {
    this.container = null;
    this.skeleton = null;
    this.expandedBones.clear();
  }
}

