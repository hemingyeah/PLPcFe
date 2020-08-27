export function taskTypeSelectConversion(taskType: any): any {
  if(!taskType) return taskType;
  
  return {
    text: taskType.name,
    value: taskType.id
  }
}