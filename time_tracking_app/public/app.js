const TimersDashboard = React.createClass({
    getInitialState: function () {
        return {
            timers: [],
        };
    },
    componentDidMount: function () { // invoked after the component fully rendered
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer, 5000);
    },
    loadTimersFromServer: function () {
        client.getTimers({
            success: (data) => {
                this.setState({timers: data});
            },
        });
    },
    handleCreateFormSubmit: function (timer) {
        this.createTimer(timer);
    },
    handleEditFormSubmit: function (attrs) {
        this.updateTimer(attrs);
    },
    handleDeleteTimer: function (id) {
        this.deleteTimer(id);
    },
    handleStartClick: function (timerId) {
        this.startTimer(timerId);
    },
    handleStopClick: function (timerId) {
        this.stopTimer(timerId);
    },
    createTimer: function (timer) {
        const t = helpers.newTimer(timer);
        this.setState({
            timers: this.state.timers.concat(t),
        });
        client.createTimer({
            data: t,
        });
    },
    updateTimer: function (attrs) {
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === attrs.id) {
                    return Object.assign({}, timer, {
                        title: attrs.title,
                        project: attrs.project,
                    });
                } else {
                    return timer;
                }
            }),
        });
        client.updateTimer({
            data: attrs,
        });
    },
    increaseTimer: function (id) {
        console.log('increasing or what?');
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === id) {
                    return Object.assign({}, timer, {
                        elapsed: timer.elapsed + 1000
                    });
                } else {
                    return timer;
                }
            }),
        });
    },
    deleteTimer: function (timerId) {
        this.setState({
            timers: this.state.timers.filter(timer => timer.id !== timerId),
        });    
        client.deleteTimer({
            data: { id: timerId },
        });    
    },  
    startTimer: function (timerId) {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === timerId) {
                    return Object.assign({}, timer, {
                        runningSince: now,
                    });
                } else {
                    return timer;
                }
            }),
        });
        client.startTimer({
            data: { id: timerId, start: now },
        });
    },
    stopTimer: function (timerId) {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if (timer.id === timerId) {
                    const lastElapsed = now - timer.runningSince;
                    return Object.assign({}, timer, {
                        elapsed: timer.elapsed + lastElapsed,
                        runningSince: null,
                    });
                } else {
                    return timer;
                }
            }),
        });
        client.stopTimer({
            data: { id: timerId, stop: now },
        });        
    },      
    render: function () {
        return (
            <div className='ui three column centered grid'>
                <div className='column'>
                    <EditableTimersList 
                        timers={this.state.timers}
                        onFormSubmit={this.handleEditFormSubmit}
                        onDeleteTimer={this.handleDeleteTimer}
                        onStartTimer={this.handleTimerStart}
                        onStartClick={this.handleStartClick}
                        onStopClick={this.handleStopClick}
                        />
                    <ToggleableTimerForm
                        onFormSubmit={this.handleCreateFormSubmit}
                        />
                </div>
            </div>
        );
    }
});

const EditableTimersList = React.createClass({
    render: function () {
        const timers = this.props.timers.map((timer) => {
            return (
                <EditableTimer
                    key={timer.id}
                    id={timer.id}
                    title={timer.title}
                    project={timer.project}
                    elapsed={timer.elapsed}
                    runningSince={timer.runningSince}
                    onFormSubmit={this.props.onFormSubmit}
                    onDeleteTimer={this.props.onDeleteTimer}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            );
        });
        return (
            <div id='timers'>
            {timers}
            </div>
        );
    }
});

const EditableTimer = React.createClass({
    getInitialState: function () {
        return (
            {
                editFormOpen: false
            }
        );
    },    
    handleEditClick: function () {
        this.openForm();
    },
    handleFormClose: function () {
        this.closeForm();
    },
    handleSubmit: function (timer) {
        this.props.onFormSubmit(timer);
        this.closeForm();
    },
    handleStartTimer: function () {
        this.props.onStartTimer(this.props.id);
    },
    closeForm: function () {
        this.setState({ editFormOpen: false });
    },
    openForm: function () {
        this.setState({ editFormOpen: true });
    },
    render: function () {
        if (this.state.editFormOpen) {
            return (
                <TimerForm
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormSubmit={this.handleSubmit}
                    onFormClose={this.handleFormClose}                    
                />
            );
        } else {
            return (
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onDeleteClick={this.props.onDeleteTimer}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            );
        }
    }    
});

const TimerForm = React.createClass({
    handleSubmit: function () {
        this.props.onFormSubmit({
            id: this.props.id,
            title: this.refs.title.value,
            project: this.refs.project.value,
        });
    },    
    render: function () {
        const submitText = this.props.id ? 'Update' : 'Create';
        return (
            <div className='ui centered card'>
                <div className='content'>
                    <div className='ui form'>
                        <div className='field'>
                            <label>Title</label>
                            <input type='text' ref='title' defaultValue={this.props.title} />
                        </div>
                        <div className='field'>
                            <label>Project</label>
                            <input type='text' ref='project' defaultValue={this.props.project} />
                        </div>
                        <div className='ui two bottom attached buttons'>
                            <button 
                                className='ui basic blue button'
                                onClick={this.handleSubmit}>
                            {submitText}
                            </button>
                            <button 
                                className='ui basic red button'
                                onClick={this.props.onFormClose}>
                            Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>            
        );
    }
});

const ToggleableTimerForm = React.createClass({
    getInitialState: function () {
        return {
            isOpen: false,
        };
    },
    handleFormOpen: function () {
        this.setState({ isOpen: true });
    },    
    handleFormClose: function () {
        this.setState({ isOpen: false });
    },
    handleFormSubmit: function (timer) {
        this.props.onFormSubmit(timer);
        this.setState({ isOpen: false });
    },
    render: function () {
        if (this.state.isOpen) {
            return (
                <TimerForm 
                    onFormSubmit={this.handleFormSubmit}
                    onFormClose={this.handleFormClose}/>
            );
        } else {
            return (
                <div className='ui basic content center aligned segment'>
                    <button className='ui basic button icon' onClick={this.handleFormOpen}>
                        <i className='plus icon'></i>
                    </button>
                </div>
            );
        }
    }
});

const Timer = React.createClass({    
    // https://facebook.github.io/react/docs/component-specs.html
    componentDidMount: function () {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
    },
    componentWillUnmount: function () {
        clearInterval(this.forceUpdateInterval);
    },   
    handleDeleteClick: function () {
        this.props.onDeleteClick(this.props.id);
    },
    handleStartClick: function () {
        this.props.onStartClick(this.props.id);
    },
    handleStopClick: function () {
        this.props.onStopClick(this.props.id);
    }, 
    handleMouseEnter: function () {
        console.log('entered?');
        this.setState({ isSettingsVisible: true });
    },
    handleMouseLeave: function () {
        this.setState({ isSettingsVisible: false });
    },    
    render: function () {
        const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
        return (
            <div className='ui centered card'
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}>
                <div className='content'>
                    <div className='header'>
                        {this.props.title}
                    </div>
                    <div className='meta'>
                        {this.props.project}
                    </div>
                    <div className='center aligned description'>
                        <h2>
                            {elapsedString}
                        </h2>
                    </div>
                    <div className='extra content'>
                        <span 
                            className='right floated edit icon'
                            onClick={this.props.onEditClick}
                            >                        
                            <i className='edit icon'></i>
                        </span>
                        <span 
                            className='right floated trash icon'
                            onClick={this.handleDeleteClick}>
                            <i className='trash icon'></i>
                        </span>
                    </div>
                </div>
                <TimerActionButton
                    timerIsRunning={!!this.props.runningSince}
                    onStartClick={this.handleStartClick}
                    onStopClick={this.handleStopClick}
                    />
            </div>
        );
    }
});

const TimerActionButton = React.createClass({
    render: function () {
        if (this.props.timerIsRunning) {
            return (
                <div
                    className='ui bottom attached red basic button'
                    onClick={this.props.onStopClick}
                    >
                    Stop
                </div>
            );
        } else {
            return (
                <div
                    className='ui bottom attached green basic button'
                    onClick={this.props.onStartClick}
                    >
                    Start
                </div>
            );
        }
    },
});

ReactDOM.render(
    <TimersDashboard />,
    document.getElementById('content')
);