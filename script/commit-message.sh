#! /bin/bash
# 获取node路径
nodePath=`which node`
PATH="$nodePath"

# 获取提交信息
if [[ $CI_COMMIT_MESSAGE ]]; then
    message=$CI_COMMIT_MESSAGE
else
    read message < .git/COMMIT_EDITMSG
fi

echo -e "\033[33m The commit msg: \033[0m $message"

# 如果信息是merge则跳过
mergePattern='^Merge '
if [[ $message =~ $mergeCommitPattern ]]; then
    echo -e "\033[32m skip the merge, commit success! \033[0m"
    exit 0
fi

# 检查提交信息
maxLength=50
length=${#message}
pattern='^(feat|fix|hotfix|test|refactor|docs|style|chroe|ci|CI)\(.*\):.*$'

if [[ $message =~ $pattern ]]; then
    if [[ $length -gt $maxLength ]]; then
        echo -e "\033[31m Error: 提交信息超过最大长度 \033[m"
        exit 1
    fi
    echo -e "\033[32m commit success! \033[0m"
else
    echo -e "\033[31m Error: 此提交信息不符合规则 \033[m"
    echo -e "\033[31m Error: type must be one of [feat,fix,hotfix,docs,style,refactor,test,chore,ci,CI] \033[m"
    exit 1
fi