<script setup lang="tsx">
import {
  NGrid, NGridItem, NSpace, NCard, NButtonGroup, NButton,
  NTag, NTime, NForm, NFormItem, NIcon, NDataTable, PaginationProps,
  useMessage, DataTableColumns, useDialog
} from 'naive-ui';
import { Add24Filled, Edit16Regular, Delete24Regular } from '@vicons/fluent';
import { onMounted, reactive, ref } from 'vue';
import { injectStore } from '../store';
import { Role, User } from '../api/resp';
import { api } from '../api';

const store = injectStore();
const message = useMessage();
const dialog = useDialog();

const pagination = reactive({
  page: 1,
  pageCount: 0,
  pageSize: 10,
  itemCount: 100,

  pageSizes: [10, 20, 30],
  showQuickJumper: true,
  showSizePicker: true,

  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
});

const users = ref<User[]>([]);
const deleting = reactive<{ [key: number]: boolean | undefined }>({});
const loading = ref(true);
const columns = ref<DataTableColumns>([
  {
    key: 'id',
    title: 'ID',
  },
  {
    key: 'username',
    title: '用户名',
  },
  {
    key: 'realName',
    title: '真实姓名',
  },
  {
    key: 'college.name',
    title: '学院',
  },
  {
    key: 'entranceYear',
    title: '入学年份',
  },
  {
    key: 'createdAt',
    title: '注册时间',
    render(rowData, rowIndex) {
      const user = rowData as unknown as User;
      return (<NTime time={new Date(user.createdAt)}></NTime>);
    }
  },
  {
    key: 'updatedAt',
    title: '更新时间',
    render(rowData, rowIndex) {
      const user = rowData as unknown as User;
      return (<NTime time={new Date(user.updatedAt)}></NTime>);
    }
  },
  {
    key: 'role',
    title: '角色',
    render(rowData, rowIndex: number) {
      rowData as unknown as User;
      if (rowData.role === Role.Admin) {
        return (<NTag type="warning">管理员</NTag>);
      } else if (rowData.role === Role.Teacher) {
        return (<NTag type="primary">教师</NTag>);
      } else if (rowData.role === Role.Student) {
        return (<NTag type="info">学生</NTag>);
      } else {
        return (<NTag type="error">ERR</NTag>);
      }
    }
  },
  {
    key: 'actions',
    title: '操作',
    render(rowData, rowIndex: number) {
      const user = rowData as unknown as User;
      const slotsEdit = {
        icon: () => (<NIcon><Edit16Regular /></NIcon>),
      };
      const slotsDelete = {
        icon: () => (<NIcon><Delete24Regular /></NIcon>),
      };
      return (
        <NSpace>
          <NButton round ghost v-slots={slotsEdit} type="info"></NButton>
          {/* TODO 编辑用户信息 */}
          <NButton round ghost v-slots={slotsDelete} type="error" loading={!!(deleting[user.id])}
            onClick={() => deleteUser(user)}
          ></NButton>
        </NSpace>
      )
    }
  },
]);

async function updateUsers(page: number, size: number) {
  loading.value = true;
  api.fetchUserList({ page, size })
    .then(data => {
      users.value = data.contents;
      pagination.page = data.pageNo;
      pagination.itemCount = data.total;
      pagination.pageCount = Math.ceil(data.total / size);
      loading.value = false;
    })
    .catch(err => {
      message.error('获取用户列表失败！' + err.message);
      loading.value = false;
    })
}

async function handlePageChange(page: number) {
  updateUsers(page, pagination.pageSize);
}

async function handlePageSizeChange(size: number) {
  updateUsers(pagination.page, size);
}

function deleteUser(user: User) {
  dialog.warning({
    title: "删除",
    content: `确认删除用户"${user.realName}(${user.username})"嘛？`,
    positiveText: "确认",
    negativeText: "取消",
    async onPositiveClick() {
      try {
        deleting[user.id] = true;
        await api.deleteUser(user.id);
        message.info(`用户"${user.realName}(${user.username})"已被删除！`);
        updateUsers(pagination.page, pagination.pageSize);
      } catch (error) {
        message.error(`删除用户失败！${(error as Error).message}`);
      } finally {
        deleting[user.id] = false;
      }
    }
  });
}

onMounted(async () => {
  updateUsers(pagination.page, pagination.pageSize);
});
</script>

<template>
  <n-grid :cols="12" style="margin-bottom: 20px;">
    <n-grid-item :span="10" :offset="1">
      <!-- <n-card> -->
      <n-space vertical>

        <n-space justify="space-between">
          <n-button ghost type="primary">
            <template #icon>
              <n-icon>
                <Add24Filled />
              </n-icon>
            </template>
            <!-- TODO 增加用户 -->
            增加用户
          </n-button>
        </n-space>

        <n-data-table remote :columns="columns" :data="users" :pagination="pagination" :loading="loading"
          @update:page="handlePageChange" @update:page-size="handlePageSizeChange" />

      </n-space>
      <!-- </n-card> -->
    </n-grid-item>
  </n-grid>
</template>