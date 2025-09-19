/**
 * ステータスモニター用JavaScript
 */
class StatusMonitor {
    constructor() {
        this.gates = [];
        this.gateGroups = []; // ゲートグループ
        this.currentLayout = 32; // デフォルト表示数
        this.statusTypes = ['normal', 'warning', 'error', 'offline'];
        this.refreshInterval = 5000; // 5秒間隔
        this.legendVisible = true;
        this.remoteControlModal = null;
        this.currentGateId = null;
        this.selectedGateGroup = null; // 選択されたゲートグループ
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateGateData();
        this.generateGateGroups();
        this.renderGateButtons();
        this.renderGates();
        this.startAutoRefresh();
        this.handleResize();
    }

    setupEventListeners() {
        // レイアウト切替ボタン
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = parseInt(e.target.dataset.layout);
                this.switchLayout(layout);
            });
        });


        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // モーダル初期化
        const modalElement = document.getElementById('remoteControlModal');
        if (modalElement) {
            this.remoteControlModal = new bootstrap.Modal(modalElement);
        }

        // サイドバートグルボタン
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    generateGateData() {
        // 最大64ゲートのデータを生成
        for (let i = 1; i <= 64; i++) {
            const gateNumber = `XA${i.toString().padStart(4, '0')}`;
            const status = this.getRandomStatus();
            
            this.gates.push({
                id: i,
                number: gateNumber,
                status: status,
                lastUpdated: new Date(),
                online: Math.random() > 0.1, // 90%の確率でオンライン
                location: this.getLocationName(i),
                icons: this.generateIconStatuses()
            });
        }
    }

    generateIconStatuses() {
        // 4つのアイコンの状態をランダム生成
        const iconTypes = ['door', 'card', 'sensor', 'comm'];
        return iconTypes.map(type => {
            const rand = Math.random();
            let status = 'normal';
            
            if (rand < 0.05) status = 'error';
            else if (rand < 0.15) status = 'warning';
            else if (rand < 0.20) status = 'offline';
            
            return {
                type: type,
                status: status,
                label: this.getIconLabel(type)
            };
        });
    }

    getIconLabel(type) {
        const labels = {
            'door': 'D',
            'card': 'C', 
            'sensor': 'S',
            'comm': 'N'
        };
        return labels[type] || '?';
    }

    getRandomStatus() {
        const weights = [0.7, 0.15, 0.1, 0.05]; // normal, warning, error, offline
        const rand = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) {
                return this.statusTypes[i];
            }
        }
        return 'normal';
    }

    getLocationName(id) {
        const locations = [
            'エントランス', 'サーバールーム', '会議室A', '会議室B', '役員室',
            'オフィス1F', 'オフィス2F', 'オフィス3F', '資料室', '倉庫',
            '駐車場', '屋上', '地下室', '休憩室', '応接室'
        ];
        return locations[id % locations.length] || `エリア${id}`;
    }

    generateGateGroups() {
        // ゲートをグループに分類
        this.gateGroups = [
            {
                id: 'gate-0001',
                name: 'ゲート-0001～',
                range: [1, 20],
                status: this.getGroupStatus([1, 20])
            },
            {
                id: 'gate-0065',
                name: 'ゲート-0065～',
                range: [21, 40],
                status: this.getGroupStatus([21, 40])
            },
            {
                id: 'gate-0400',
                name: 'ゲート-0400～',
                range: [41, 60],
                status: this.getGroupStatus([41, 60])
            },
            {
                id: 'sensor-0066',
                name: 'センサー-0066～',
                range: [61, 64],
                status: this.getGroupStatus([61, 64])
            }
        ];
    }

    getGroupStatus(range) {
        const gatesInRange = this.gates.filter(gate => 
            gate.id >= range[0] && gate.id <= range[1]
        );
        
        if (gatesInRange.some(gate => gate.status === 'error')) return 'error';
        if (gatesInRange.some(gate => gate.status === 'warning')) return 'warning';
        if (gatesInRange.some(gate => !gate.online)) return 'offline';
        return 'normal';
    }

    switchLayout(layout) {
        this.currentLayout = layout;
        
        // ボタンのアクティブ状態更新
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.layout) === layout);
        });

        this.updateGridLayout();
        this.renderGates();
    }

    updateGridLayout() {
        const grid = document.getElementById('gateGrid');
        const container = document.querySelector('.gate-grid-container');
        if (!grid || !container) return;

        // コンテナの実際の幅を取得（完全に安全な計算）
        const containerWidth = container.clientWidth;
        const gapSize = 6;
        const cardPadding = 16; // カード内のpadding
        const minCardContentWidth = 140; // カード内容の最小幅
        const minCardWidth = minCardContentWidth + cardPadding;
        
        // 完全に安全な列数計算（レイアウトに応じて調整）
        let maxCols = this.currentLayout === 64 ? 8 : 5;
        const totalGapWidth = gapSize * (maxCols - 1);
        const safetyMargin = this.currentLayout === 64 ? 30 : 50; // 64件時は余裕を少なく
        const availableWidthForCards = containerWidth - totalGapWidth - safetyMargin;
        let cols = Math.floor(availableWidthForCards / minCardWidth);
        
        // レイアウトに応じた制限
        if (this.currentLayout === 16) {
            cols = Math.min(cols, 4);
            cols = Math.max(cols, 2);
        } else if (this.currentLayout === 32) {
            cols = Math.min(cols, 5); // 確実に表示するため5列制限
            cols = Math.max(cols, 3);
        } else { // 64件
            cols = Math.min(cols, 7); // 64件は7列まで許可（8列だと切れるため）
            cols = Math.max(cols, 6);
        }
        
        const rows = Math.ceil(this.currentLayout / cols);
        const actualCardWidth = Math.floor((containerWidth - (cols-1) * gapSize) / cols);

        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // 64件表示用のCSSクラスを適用
        if (this.currentLayout === 64) {
            grid.classList.add('layout-64');
        } else {
            grid.classList.remove('layout-64');
        }
        
        console.log(`Container: ${containerWidth}px, Cols: ${cols}, Layout: ${this.currentLayout}, Card: ${actualCardWidth}px`);
    }

    renderGates() {
        const grid = document.getElementById('gateGrid');
        if (!grid) return;

        grid.innerHTML = '';

        let displayGates;
        if (this.selectedGateGroup) {
            // 選択されたグループのゲートのみ表示
            const group = this.gateGroups.find(g => g.id === this.selectedGateGroup);
            if (group) {
                displayGates = this.gates.filter(gate => 
                    gate.id >= group.range[0] && gate.id <= group.range[1]
                );
            } else {
                displayGates = this.gates.slice(0, this.currentLayout);
            }
        } else {
            // 全ゲート表示
            displayGates = this.gates.slice(0, this.currentLayout);
        }

        displayGates.forEach(gate => {
            const gateCard = this.createGateCard(gate);
            grid.appendChild(gateCard);
        });
    }

    renderGateButtons() {
        const buttonList = document.getElementById('gateButtonList');
        if (!buttonList) return;

        buttonList.innerHTML = '';

        this.gateGroups.forEach(group => {
            const button = document.createElement('button');
            button.className = 'gate-button';
            button.setAttribute('data-group-id', group.id);
            
            const statusClass = `status-${group.status}`;
            button.innerHTML = `
                <span class="gate-button-text">${group.name}</span>
                <span class="gate-button-short">${group.name.substring(0, 3)}</span>
                <div class="gate-button-status ${statusClass}"></div>
            `;
            
            button.addEventListener('click', () => {
                this.selectGateGroup(group.id);
            });
            
            buttonList.appendChild(button);
        });
    }

    selectGateGroup(groupId) {
        // 以前のアクティブボタンを解除
        document.querySelectorAll('.gate-button.active').forEach(btn => {
            btn.classList.remove('active');
        });

        // 新しいボタンをアクティブに
        const button = document.querySelector(`[data-group-id="${groupId}"]`);
        if (button) {
            button.classList.add('active');
        }

        this.selectedGateGroup = groupId;
        this.renderGates();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        const container = document.querySelector('.status-monitor-container');
        const toggleIcon = document.getElementById('toggleIcon');
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            container.classList.add('sidebar-collapsed');
            toggleIcon.textContent = '›';
        } else {
            sidebar.classList.remove('collapsed');
            container.classList.remove('sidebar-collapsed');
            toggleIcon.textContent = '‹';
        }
        
        // グリッドレイアウトを再計算
        setTimeout(() => {
            this.handleResize();
        }, 300); // CSS transitionの完了を待つ
    }

    createGateCard(gate) {
        const card = document.createElement('div');
        card.className = 'gate-card';
        card.setAttribute('data-gate-id', gate.id);

        // 状態に応じたボーダーカラー
        const statusClass = gate.online ? gate.status : 'offline';
        card.style.borderColor = this.getStatusColor(statusClass);

        // アイコングリッドを生成
        const iconGridHtml = this.createIconGrid(gate.icons);

        card.innerHTML = `
            <div class="gate-info">
                <div class="gate-number">${gate.number}</div>
                <div class="gate-status-indicator status-${statusClass}"></div>
            </div>
            ${iconGridHtml}
            <div class="gate-buttons">
                <button class="btn btn-history btn-sm" onclick="statusMonitor.showHistory('${gate.number}')">
                    履歴
                </button>
                <button class="btn btn-remote btn-sm" onclick="statusMonitor.showRemoteControl('${gate.number}')">
                    遠隔
                </button>
            </div>
        `;

        return card;
    }

    createIconGrid(icons) {
        let iconHtml = '<div class="icon-grid">';
        
        icons.forEach(icon => {
            const iconClass = this.getIconClass(icon.status, icon.type);
            iconHtml += `<div class="status-icon ${iconClass}">${icon.label}</div>`;
        });
        
        iconHtml += '</div>';
        return iconHtml;
    }

    getIconClass(status, type) {
        if (status === 'error') return 'icon-error';
        if (status === 'warning') return 'icon-sensor';
        if (status === 'offline') return 'icon-offline';
        
        // 正常時は各アイコンタイプに応じた色
        return `icon-${type}`;
    }

    getStatusColor(status) {
        const colors = {
            'normal': '#28a745',
            'warning': '#ffc107', 
            'error': '#dc3545',
            'offline': '#6c757d'
        };
        return colors[status] || '#dee2e6';
    }

    showHistory(gateNumber) {
        // 履歴画面への遷移処理
        console.log(`履歴表示: ${gateNumber}`);
        // 実装では適切なURL（例: /history?gate=${gateNumber}）に遷移
        alert(`${gateNumber}の履歴を表示します`);
    }

    showRemoteControl(gateNumber) {
        this.currentGateId = gateNumber;
        document.getElementById('modalGateNumber').textContent = gateNumber;
        
        if (this.remoteControlModal) {
            this.remoteControlModal.show();
        }
    }

    executeRemoteCommand(command) {
        if (!this.currentGateId) return;

        // 実際の実装では、サーバーに対してAJAXリクエストを送信
        console.log(`遠隔操作: ${this.currentGateId} - ${command}`);
        
        const commandNames = {
            'unlock': 'ドア解錠',
            'lock': 'ドア施錠', 
            'reset': 'リセット',
            'status': 'ステータス確認'
        };

        alert(`${this.currentGateId}に${commandNames[command]}コマンドを送信しました`);
        
        // モーダルを閉じる
        if (this.remoteControlModal) {
            this.remoteControlModal.hide();
        }
    }

    toggleLegend() {
        const legendPanel = document.getElementById('legendPanel');
        const toggleBtn = document.getElementById('toggleLegend');
        
        if (legendPanel && toggleBtn) {
            this.legendVisible = !this.legendVisible;
            legendPanel.style.display = this.legendVisible ? 'block' : 'none';
            toggleBtn.textContent = this.legendVisible ? '凡例非表示' : '凡例表示';
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            this.updateGateStatuses();
        }, this.refreshInterval);
    }

    updateGateStatuses() {
        // ランダムに数個のゲートの状態を更新
        const updateCount = Math.floor(Math.random() * 3) + 1; // 1-3個更新
        
        for (let i = 0; i < updateCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.gates.length);
            const gate = this.gates[randomIndex];
            
            // 10%の確率で状態変更
            if (Math.random() < 0.1) {
                gate.status = this.getRandomStatus();
                gate.lastUpdated = new Date();
                gate.online = Math.random() > 0.05; // 95%の確率でオンライン
                gate.icons = this.generateIconStatuses(); // アイコン状態も更新
            }
        }

        // グループステータスも更新
        this.gateGroups.forEach(group => {
            group.status = this.getGroupStatus(group.range);
        });

        this.renderGateButtons();
        this.renderGates();
    }

    handleResize() {
        // レスポンシブ対応: 画面サイズに応じて自動調整
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 画面サイズに応じた推奨表示数を計算
        let recommendedLayout = 32;
        
        if (screenWidth >= 1920 && screenHeight >= 1080) {
            recommendedLayout = 64;
        } else if (screenWidth >= 1400) {
            recommendedLayout = 32;
        } else if (screenWidth < 992) {
            recommendedLayout = 16;
        }

        // 現在のレイアウトが画面サイズに適さない場合は自動調整
        if (this.currentLayout > recommendedLayout) {
            this.switchLayout(recommendedLayout);
        }

        this.updateGridLayout();
    }

    // 外部からアクセス可能なメソッド
    refreshData() {
        this.generateGateData();
        this.renderGates();
    }

    setRefreshInterval(interval) {
        this.refreshInterval = interval;
    }
}

// グローバルインスタンス
let statusMonitor;

// 遠隔操作コマンド実行（グローバル関数）
function executeRemoteCommand(command) {
    if (statusMonitor) {
        statusMonitor.executeRemoteCommand(command);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    statusMonitor = new StatusMonitor();
});