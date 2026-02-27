/**
 * 游戏类型选择门户 JavaScript
 * 处理游戏类型选择、创建新游戏、打开已有游戏等功能
 */

// 当前选择的游戏类型
let currentGameType = null;

/**
 * 游戏类型名称映射表
 */
const GAME_TYPE_NAMES = {
  '2d-strategy': '2D 策略战棋',
  '2d-metroidvania': '2D 恶魔城',
  '2d-rpg': '2D 角色扮演',
  '3d-shooter': '3D 射击'
};

/**
 * 选择游戏类型
 * @param {string} type - 游戏类型
 */
function selectGameType(type) {
  currentGameType = type;
  console.log(`选择游戏类型: ${GAME_TYPE_NAMES[type]}`);
}

/**
 * 创建新游戏
 * @param {string} type - 游戏类型
 * @param {Event} event - 事件对象
 */
function createNewGame(type, event) {
  if (event) {
    event.stopPropagation();
  }

  const gameName = prompt(`请输入 ${GAME_TYPE_NAMES[type]} 游戏名称:`);
  if (!gameName || gameName.trim() === '') {
    return;
  }

  showLoading();

  // 调用后端 API 创建游戏
  fetch(`/api/game/create?name=${encodeURIComponent(gameName.trim())}&type=${type}&description=`, {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      hideLoading();
      if (data.success && data.data) {
        console.log('游戏创建成功:', data.data);
        // 跳转到编辑器页面
        window.location.href = `/create-game/unity/${type}?gameId=${data.data.id}`;
      } else {
        alert('创建游戏失败: ' + (data.error || '未知错误'));
        console.error('创建游戏失败:', data);
      }
    })
    .catch(error => {
      hideLoading();
      alert('创建游戏失败: ' + error.message);
      console.error('创建游戏请求失败:', error);
    });
}

/**
 * 打开游戏列表
 * @param {string} type - 游戏类型
 * @param {Event} event - 事件对象
 */
function openGameList(type, event) {
  if (event) {
    event.stopPropagation();
  }

  currentGameType = type;

  const gamesList = document.getElementById('gamesList');
  const content = document.getElementById('gamesListContent');

  if (!gamesList || !content) {
    console.error('游戏列表元素未找到');
    return;
  }

  gamesList.classList.add('active');
  content.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">加载中...</p>';

  // 调用后端 API 获取游戏列表
  fetch(`/api/game/list?type=${type}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.games && data.games.length > 0) {
        content.innerHTML = data.games.map(game => `
          <div class="game-item" onclick="selectGame('${game.id}', '${type}')">
            <div class="game-item-name">${escapeHtml(game.name)}</div>
            <div class="game-item-type">${GAME_TYPE_NAMES[type]}</div>
            <div class="game-item-date">${game.updatedAt ? formatDate(game.updatedAt) : '未知日期'}</div>
          </div>
        `).join('');
        console.log(`加载了 ${data.games.length} 个游戏`);
      } else {
        content.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">还没有游戏，请先创建一个</p>';
      }
    })
    .catch(error => {
      content.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">加载失败: ${error.message}</p>`;
      console.error('加载游戏列表失败:', error);
    });
}

/**
 * 选择游戏并跳转到编辑器
 * @param {string} gameId - 游戏 ID
 * @param {string} type - 游戏类型
 */
function selectGame(gameId, type) {
  console.log(`选择游戏: ${gameId}, 类型: ${type}`);
  window.location.href = `/create-game/unity/${type}?gameId=${gameId}`;
}

/**
 */
function closeGamesList() {
  const gamesList = document.getElementById('gamesList');
  if (gamesList) {
    gamesList.classList.remove('active');
  }
}

/**
 * 显示加载动画
 */
function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

/**
 * 获取游戏类型名称
 * @param {string} type - 游戏类型
 * @returns {string} 游戏类型的中文名称
 */
function getGameTypeName(type) {
  return GAME_TYPE_NAMES[type] || type;
}

/**
 * HTML 转义，防止 XSS 攻击
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('游戏门户页面已加载');

  // 点击外部关闭游戏列表
  document.addEventListener('click', function(event) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    // 检查点击目标是否在游戏列表或打开按钮内
    const isClickInsideList = gamesList.contains(event.target);
    const isClickOnOpenButton = event.target.classList.contains('btn-open');

    if (!isClickInsideList && !isClickOnOpenButton) {
      closeGamesList();
    }
  });

  // ESC 键关闭游戏列表
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeGamesList();
    }
  });

  // 为卡片添加键盘导航支持
  const cards = document.querySelectorAll('.game-card');
  cards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const type = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (type) {
          createNewGame(type, event);
        }
      }
    });
  });
});

/**
 * 导出函数供外部使用（如果需要）
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectGameType,
    createNewGame,
    openGameList,
    selectGame,
    closeGamesList,
    showLoading,
    hideLoading,
    getGameTypeName
  };
}

