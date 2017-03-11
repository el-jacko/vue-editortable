export default {
  data() {
    return {
      currentPage: 0,
      maxNumber: 0,
      resultCount: 0,
    };
  },
  methods: {
    setPage(pageNumber) {
      this.currentPage = pageNumber - 1;
    },
    resetCurrentPage() {
      this.currentPage = 0;
    },
    showPrev() {
      if (this.isStartPage) return;
      this.currentPage -= 1;
    },
    showNext() {
      if (this.isEndPage) return;
      this.currentPage += 1;
    },
    paginate(data) {
      this.resultCount = data.length;
      this.maxNumber = this.totalPages - 1;
      const index = this.currentPage * this.opt.pagination.itemsPerPage;
      return data.slice(index, index + this.opt.pagination.itemsPerPage);
    },
    isInPaginationRange(pageNumber) {
      let show;
      if (
        this.maxNumber < 7 ||
        pageNumber === 1 ||
        pageNumber >= this.maxNumber + 1 ||
        (pageNumber <= 5 && this.currentPage < 3) ||
        (pageNumber >= this.maxNumber - 3 && this.currentPage > this.maxNumber - 4) ||
        (pageNumber >= this.currentPage && pageNumber <= (this.currentPage + 2))
        ) {
        show = true;
      }
      return show;
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.resultCount / this.opt.pagination.itemsPerPage);
    },
    isStartPage() {
      return (this.currentPage === 0);
    },
    isEndPage() {
      return (this.currentPage + 1) *
      this.opt.pagination.itemsPerPage >= this.resultCount;
    },
  },
};
