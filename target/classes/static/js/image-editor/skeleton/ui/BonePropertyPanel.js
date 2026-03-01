/**
 * BonePropertyPanel.js - 骨骼属性编辑面板
 *
 * 编辑选定骨骼的属性（位置、旋转、缩放等）
 */
class BonePropertyPanel {
  constructor(skeleton) {
    this.skeleton = skeleton;
    this.container = null;
    this.currentBone = null;

    // 回调
    this.onChange = null;
  }

  /**
   * 初始化面板
   */
  init(parentSelector) {
    this.container = document.querySelector(parentSelector);
    if (!this.container) {
      console.warn(`BonePropertyPanel: Parent element not found: ${parentSelector}`);
      return;
    }

    this.container.innerHTML = `
      <div class="bone-property-panel">
        <div class="property-group">
          <div class="property-group-header">位置 (Position)</div>
          <div class="property-group-content">
            <div class="property-item">
              <label class="property-label">X</label>
              <input type="number" class="property-input" id="pos-x" step="1">
            </div>
            <div class="property-item">
              <label class="property-label">Y</label>
              <input type="number" class="property-input" id="pos-y" step="1">
            </div>
          </div>
        </div>

        <div class="property-group">
          <div class="property-group-header">旋转 (Rotation)</div>
          <div class="property-group-content">
            <div class="property-item">
              <label class="property-label">角度</label>
              <input type="number" class="property-input" id="rot-angle" step="0.01">
              <span style="font-size: 11px; color: #888; margin-left: 4px;">弧度</span>
            </div>
          </div>
        </div>

        <div class="property-group">
          <div class="property-group-header">缩放 (Scale)</div>
          <div class="property-group-content">
            <div class="property-item">
              <label class="property-label">X</label>
              <input type="number" class="property-input" id="scale-x" step="0.1" value="1">
            </div>
            <div class="property-item">
              <label class="property-label">Y</label>
              <input type="number" class="property-input" id="scale-y" step="0.1" value="1">
            </div>
          </div>
        </div>

        <div class="property-group">
          <div class="property-group-header">其他</div>
          <div class="property-group-content">
            <div class="property-item">
              <label class="property-label">长度</label>
              <input type="number" class="property-input" id="length" step="1" value="50">
            </div>
            <div class="property-item">
              <label class="property-label">名称</label>
              <input type="text" class="property-input" id="name">
            </div>
          </div>
        </div>
      </div>
    `;

    this._setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  _setupEventListeners() {
    const inputs = this.container.querySelectorAll('.property-input');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this._onInputChange(e));
      input.addEventListener('input', (e) => this._onInputChange(e));
    });
  }

  /**
   * 输入变化处理
   */
  _onInputChange(e) {
    if (!this.currentBone) return;

    const id = e.target.id;
    const value = parseFloat(e.target.value) || e.target.value;

    switch (id) {
      case 'pos-x':
        this.skeleton.setBonePosition(this.currentBone.id, value, this.currentBone.position.y);
        break;
      case 'pos-y':
        this.skeleton.setBonePosition(this.currentBone.id, this.currentBone.position.x, value);
        break;
      case 'rot-angle':
        this.skeleton.setBoneRotation(this.currentBone.id, value);
        break;
      case 'scale-x':
        this.skeleton.setBoneScale(this.currentBone.id, value, this.currentBone.scale.y);
        break;
      case 'scale-y':
        this.skeleton.setBoneScale(this.currentBone.id, this.currentBone.scale.x, value);
        break;
      case 'length':
        this.currentBone.length = value;
        break;
      case 'name':
        this.currentBone.name = value;
        break;
    }

    if (this.onChange) {
      this.onChange();
    }
  }

  /**
   * 选择骨骼进行编辑
   */
  selectBone(boneId) {
    const bone = this.skeleton.getBone(boneId);
    if (!bone) {
      this.currentBone = null;
      this._clearInputs();
      return;
    }

    this.currentBone = bone;
    this._updateInputs();
  }

  /**
   * 更新输入框的值
   */
  _updateInputs() {
    if (!this.currentBone) {
      this._clearInputs();
      return;
    }

    const bone = this.currentBone;

    this.container.querySelector('#pos-x').value = bone.position.x.toFixed(2);
    this.container.querySelector('#pos-y').value = bone.position.y.toFixed(2);
    this.container.querySelector('#rot-angle').value = bone.rotation.toFixed(4);
    this.container.querySelector('#scale-x').value = bone.scale.x.toFixed(2);
    this.container.querySelector('#scale-y').value = bone.scale.y.toFixed(2);
    this.container.querySelector('#length').value = bone.length.toFixed(0);
    this.container.querySelector('#name').value = bone.name;
  }

  /**
   * 清除所有输入
   */
  _clearInputs() {
    const inputs = this.container.querySelectorAll('.property-input');
    inputs.forEach(input => {
      input.value = '';
      input.disabled = true;
    });
  }

  /**
   * 清理
   */
  dispose() {
    this.container = null;
    this.skeleton = null;
    this.currentBone = null;
  }
}

