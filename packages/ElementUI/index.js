
import Vue from 'vue';

import {
  Row,
  Col,
  Form,
  FormItem,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Input,
  Button,
  ButtonGroup,
  Select,
  Option,
  OptionGroup,
  DatePicker,
  TimePicker,
  Switch,
  Table,
  TableColumn,
  Pagination,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Loading,
  Tabs,
  TabPane,
  Dialog,
  Autocomplete,
  Message,
  Tooltip,
  MessageBox,
  Notification,
  RadioButton,
  Tag,
  Popover
} from 'element-ui';

Vue.component(Row.name, Row);
Vue.component(Col.name, Col);

Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);

Vue.component(Checkbox.name, Checkbox);
Vue.component(CheckboxGroup.name, CheckboxGroup);

Vue.component(Radio.name, Radio);
Vue.component(RadioGroup.name, RadioGroup);

Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(OptionGroup.name, OptionGroup);
Vue.component(Switch.name, Switch);

Vue.component(DatePicker.name, DatePicker);
Vue.component(TimePicker.name, TimePicker);

Vue.component(Input.name, Input);
Vue.component(Autocomplete.name, Autocomplete);

Vue.component(Button.name, Button);
Vue.component(ButtonGroup.name, ButtonGroup);

Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Pagination.name, Pagination);

Vue.component(Dropdown.name, Dropdown);
Vue.component(DropdownMenu.name, DropdownMenu);
Vue.component(DropdownItem.name, DropdownItem);

Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);

Vue.component(Dialog.name, Dialog);

Vue.component(Tooltip.name, Tooltip);
Vue.component(RadioButton.name, RadioButton);
Vue.component(Tag.name, Tag);
Vue.component(Popover.name, Popover);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$alert = MessageBox.alert;

import './index.scss'
