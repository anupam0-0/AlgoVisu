export class TreeNode {
  value: number
  left: TreeNode | null = null
  right: TreeNode | null = null

  constructor(value: number) {
    this.value = value
  }
}

export class BinarySearchTree {
  root: TreeNode | null = null

  insert(value: number): TreeNode[] {
    const path: TreeNode[] = []

    if (!this.root) {
      this.root = new TreeNode(value)
      return [this.root]
    }

    let current = this.root
    path.push(current)

    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = new TreeNode(value)
          path.push(current.left)
          break
        }
        current = current.left
      } else {
        if (!current.right) {
          current.right = new TreeNode(value)
          path.push(current.right)
          break
        }
        current = current.right
      }
      path.push(current)
    }

    return path
  }

  search(value: number): TreeNode[] {
    const path: TreeNode[] = []
    let current = this.root

    while (current) {
      path.push(current)
      if (value === current.value) {
        break
      } else if (value < current.value) {
        current = current.left
      } else {
        current = current.right
      }
    }

    return path
  }

  inorderTraversal(): number[] {
    const result: number[] = []

    function traverse(node: TreeNode | null) {
      if (node) {
        traverse(node.left)
        result.push(node.value)
        traverse(node.right)
      }
    }

    traverse(this.root)
    return result
  }
}

export class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  toArray(): T[] {
    return [...this.items]
  }
}

export class Queue<T> {
  private items: T[] = []

  enqueue(item: T): void {
    this.items.push(item)
  }

  dequeue(): T | undefined {
    return this.items.shift()
  }

  front(): T | undefined {
    return this.items[0]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  toArray(): T[] {
    return [...this.items]
  }
}
